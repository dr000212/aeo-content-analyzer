import re
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from app.analyzers.base import BaseAnalyzer
from app.models.response import (
    Category,
    Check,
    Effort,
    ModuleResult,
    Priority,
    Recommendation,
)
from app.utils.html_parser import extract_headings, extract_links, extract_meta_tags, extract_paragraphs
from app.utils.text_utils import calculate_word_frequency, count_words


def _get_nlp():
    """Lazy-load spaCy model singleton."""
    if not hasattr(_get_nlp, "_nlp"):
        import spacy
        _get_nlp._nlp = spacy.load("en_core_web_md")
    return _get_nlp._nlp


class EntityAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str) -> ModuleResult:
        checks: list[Check] = []
        recommendations: list[Recommendation] = []
        score = 0

        nlp = _get_nlp()
        # Limit text to avoid spaCy memory issues on huge pages
        doc = nlp(text[:100_000])

        entities = list(set(ent.text for ent in doc.ents))
        noun_chunks = list(set(chunk.text.lower() for chunk in doc.noun_chunks))

        headings = extract_headings(soup)
        paragraphs = extract_paragraphs(soup)
        meta = extract_meta_tags(soup)
        word_count = count_words(text)

        # Determine the page's base URL for link classification
        base_url = ""
        canonical = soup.find("link", rel="canonical")
        if canonical and canonical.get("href"):
            base_url = canonical["href"]
        og_url = meta.get("og:url", "")
        if not base_url and og_url:
            base_url = og_url

        links = extract_links(soup, base_url) if base_url else {"internal": [], "external": []}

        # ent_01: Named entities detected (at least 5 unique)
        has_enough_entities = len(entities) >= 5
        checks.append(Check(
            id="ent_01",
            passed=has_enough_entities,
            text=f"Named entities: {len(entities)} unique entities found",
            impact="High",
            category=Category.ENTITY,
        ))
        if has_enough_entities:
            score += 20
        else:
            recommendations.append(Recommendation(
                title="Increase entity coverage",
                description=f"Content has low entity coverage ({len(entities)} entities). Add more specific names, organizations, concepts, and technical terms.",
                priority=Priority.HIGH,
                category=Category.ENTITY,
                impact_score=8,
                effort=Effort.MEDIUM,
            ))

        # ent_02: Primary keyword in first paragraph, heading, and meta description
        freq = calculate_word_frequency(text)
        # Guess primary keyword: most frequent non-stopword with 4+ chars
        stopwords = {"this", "that", "with", "from", "they", "have", "been", "will",
                      "about", "their", "which", "would", "there", "could", "other",
                      "than", "your", "more", "also", "into", "some", "when", "what",
                      "were", "each", "make", "like", "just", "over", "such", "after"}
        keyword_candidates = {w: c for w, c in freq.items() if len(w) >= 4 and w not in stopwords}
        primary_keyword = max(keyword_candidates, key=keyword_candidates.get) if keyword_candidates else ""

        in_first_p = primary_keyword.lower() in (paragraphs[0].lower() if paragraphs else "")
        in_heading = any(primary_keyword.lower() in h["text"].lower() for h in headings)
        in_meta_desc = primary_keyword.lower() in meta.get("description", "").lower()
        keyword_distributed = in_first_p and in_heading and in_meta_desc

        checks.append(Check(
            id="ent_02",
            passed=keyword_distributed,
            text=f"Primary keyword '{primary_keyword}' distribution: first_p={in_first_p}, heading={in_heading}, meta={in_meta_desc}",
            impact="High",
            category=Category.ENTITY,
        ))
        if keyword_distributed:
            score += 20
        else:
            recommendations.append(Recommendation(
                title="Improve keyword distribution",
                description="Primary topic keyword not well-distributed — ensure it appears in the first paragraph, at least one heading, and meta description.",
                priority=Priority.HIGH,
                category=Category.ENTITY,
                impact_score=8,
                effort=Effort.LOW,
            ))

        # ent_03: Keyword density 1-3%
        if primary_keyword and word_count > 0:
            kw_count = freq.get(primary_keyword, 0)
            density = (kw_count / word_count) * 100
        else:
            density = 0.0
        density_ok = 1.0 <= density <= 3.0

        checks.append(Check(
            id="ent_03",
            passed=density_ok,
            text=f"Keyword density: {density:.1f}%",
            impact="Medium",
            category=Category.ENTITY,
        ))
        if density_ok:
            score += 15
        else:
            recommendations.append(Recommendation(
                title="Adjust keyword density",
                description=f"Keyword density is {density:.1f}% — target 1-3% for natural optimization without over-stuffing.",
                priority=Priority.MEDIUM,
                category=Category.ENTITY,
                impact_score=6,
                effort=Effort.LOW,
            ))

        # ent_04: Has definitions or explanations for key terms
        definition_patterns = [
            r"\bis\s+defined\s+as\b",
            r"\brefers\s+to\b",
            r"\bmeans\b",
            r"\bis\s+a\s+\w+\s+that\b",
            r"\bis\s+the\s+process\s+of\b",
        ]
        has_definitions = any(re.search(p, text, re.I) for p in definition_patterns)
        checks.append(Check(
            id="ent_04",
            passed=has_definitions,
            text=f"Key term definitions: {'found' if has_definitions else 'not found'}",
            impact="Medium",
            category=Category.ENTITY,
        ))
        if has_definitions:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add definitions for key terms",
                description="AI engines prefer content that defines concepts before using them.",
                priority=Priority.MEDIUM,
                category=Category.ENTITY,
                impact_score=6,
                effort=Effort.MEDIUM,
            ))

        # ent_05: Internal links (at least 2)
        internal_count = len(links["internal"])
        has_internal_links = internal_count >= 2
        checks.append(Check(
            id="ent_05",
            passed=has_internal_links,
            text=f"Internal links: {internal_count} found",
            impact="Medium",
            category=Category.ENTITY,
        ))
        if has_internal_links:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add internal links",
                description=f"{internal_count} internal links found. Link to 3+ related pages to signal topical depth.",
                priority=Priority.MEDIUM,
                category=Category.ENTITY,
                impact_score=6,
                effort=Effort.LOW,
            ))

        # ent_06: External citations (at least 1)
        external_count = len(links["external"])
        has_external = external_count >= 1
        checks.append(Check(
            id="ent_06",
            passed=has_external,
            text=f"External references: {external_count} found",
            impact="Medium",
            category=Category.ENTITY,
        ))
        if has_external:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add authoritative external references",
                description="Citing reputable sources increases content trustworthiness for AI engines.",
                priority=Priority.MEDIUM,
                category=Category.ENTITY,
                impact_score=5,
                effort=Effort.LOW,
            ))

        # ent_07: Multiple subtopics (noun phrase variety)
        unique_chunks = len(noun_chunks)
        has_subtopics = unique_chunks >= 10
        checks.append(Check(
            id="ent_07",
            passed=has_subtopics,
            text=f"Subtopic coverage: {unique_chunks} unique noun phrases",
            impact="Low",
            category=Category.ENTITY,
        ))
        if has_subtopics:
            score += 9
        else:
            recommendations.append(Recommendation(
                title="Expand subtopic coverage",
                description="Content focuses narrowly. Add sections covering related aspects of the topic.",
                priority=Priority.LOW,
                category=Category.ENTITY,
                impact_score=4,
                effort=Effort.HIGH,
            ))

        return ModuleResult(
            score=min(score, 100),
            checks=checks,
            recommendations=recommendations,
            details={
                "entity_count": len(entities),
                "primary_keyword": primary_keyword,
                "keyword_density": round(density, 2),
                "internal_links": internal_count,
                "external_links": external_count,
                "noun_phrase_count": unique_chunks,
            },
        )
