import re

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
from app.utils.text_utils import count_words, split_sentences


HEDGING_WORDS = {"might", "perhaps", "possibly", "maybe", "could", "probably",
                  "seemingly", "apparently", "arguably", "potentially"}


def _flesch_reading_ease(text: str) -> float:
    import textstat
    return textstat.flesch_reading_ease(text)


def _detect_passive_sentences(sentences: list[str]) -> int:
    """Count sentences with passive voice using spaCy POS tagging."""
    try:
        from app.analyzers.entity import _get_nlp
        nlp = _get_nlp()
    except Exception:
        return 0

    passive_count = 0
    for sent in sentences:
        doc = nlp(sent)
        # Pattern: auxiliary be verb + past participle (VBN)
        tokens = list(doc)
        for i, token in enumerate(tokens):
            if token.lemma_ in ("be",) and token.pos_ == "AUX":
                # Check if followed by a past participle
                for j in range(i + 1, min(i + 4, len(tokens))):
                    if tokens[j].tag_ == "VBN":
                        passive_count += 1
                        break
                break  # Only check once per sentence
    return passive_count


class ReadabilityAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str) -> ModuleResult:
        checks: list[Check] = []
        recommendations: list[Recommendation] = []
        score = 0

        sentences = split_sentences(text)
        total_sentences = len(sentences) if sentences else 1
        sentence_lengths = [count_words(s) for s in sentences]
        avg_sentence_length = sum(sentence_lengths) / total_sentences if sentences else 0

        # read_01: Flesch Reading Ease 50-70
        fre = _flesch_reading_ease(text) if text.strip() else 0
        fre_ok = 50 <= fre <= 70
        checks.append(Check(
            id="read_01",
            passed=fre_ok,
            text=f"Flesch Reading Ease: {fre:.1f}",
            impact="High",
            category=Category.READABILITY,
        ))
        if fre_ok:
            score += 18
        else:
            recommendations.append(Recommendation(
                title="Adjust readability level",
                description=f"Readability score is {fre:.1f} — target 50-70 for content that's accessible yet authoritative.",
                priority=Priority.HIGH,
                category=Category.READABILITY,
                impact_score=8,
                effort=Effort.MEDIUM,
            ))

        # read_02: Average sentence length 15-25 words
        avg_ok = 15 <= avg_sentence_length <= 25
        checks.append(Check(
            id="read_02",
            passed=avg_ok,
            text=f"Average sentence length: {avg_sentence_length:.1f} words",
            impact="High",
            category=Category.READABILITY,
        ))
        if avg_ok:
            score += 18
        else:
            advice = "Break complex sentences." if avg_sentence_length > 25 else "Combine fragments for better flow."
            recommendations.append(Recommendation(
                title="Adjust sentence length",
                description=f"Average sentence length is {avg_sentence_length:.1f} words — target 15-25 words. {advice}",
                priority=Priority.HIGH,
                category=Category.READABILITY,
                impact_score=7,
                effort=Effort.MEDIUM,
            ))

        # read_03: Passive voice < 15%
        passive_count = _detect_passive_sentences(sentences)
        passive_pct = (passive_count / total_sentences) * 100 if total_sentences else 0
        passive_ok = passive_pct < 15
        checks.append(Check(
            id="read_03",
            passed=passive_ok,
            text=f"Passive voice: {passive_pct:.1f}% of sentences",
            impact="Medium",
            category=Category.READABILITY,
        ))
        if passive_ok:
            score += 14
        else:
            recommendations.append(Recommendation(
                title="Reduce passive voice",
                description=f"{passive_pct:.1f}% of sentences use passive voice (target: <15%). Rewrite passive constructions for stronger, more direct statements.",
                priority=Priority.MEDIUM,
                category=Category.READABILITY,
                impact_score=6,
                effort=Effort.MEDIUM,
            ))

        # read_04: No excessively long sentences (> 40 words)
        long_sentences = [l for l in sentence_lengths if l > 40]
        no_long = len(long_sentences) == 0
        checks.append(Check(
            id="read_04",
            passed=no_long,
            text=f"Long sentences (>40 words): {len(long_sentences)} found",
            impact="Medium",
            category=Category.READABILITY,
        ))
        if no_long:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Split long sentences",
                description=f"{len(long_sentences)} sentences exceed 40 words. Split them for clarity — AI engines prefer concise, extractable statements.",
                priority=Priority.MEDIUM,
                category=Category.READABILITY,
                impact_score=6,
                effort=Effort.MEDIUM,
            ))

        # read_05: Author or organization name present
        has_author = False
        # Check for author meta tag
        author_meta = soup.find("meta", attrs={"name": "author"})
        if author_meta and author_meta.get("content"):
            has_author = True
        # Check for rel="author" link
        if soup.find("a", rel="author"):
            has_author = True
        # Check for common author patterns in class/id
        if soup.find(class_=re.compile(r"author|byline", re.I)):
            has_author = True
        # Check JSON-LD for author
        for script in soup.find_all("script", type="application/ld+json"):
            if script.string and '"author"' in script.string:
                has_author = True
                break

        checks.append(Check(
            id="read_05",
            passed=has_author,
            text=f"Author/organization signal: {'found' if has_author else 'not found'}",
            impact="Medium",
            category=Category.READABILITY,
        ))
        if has_author:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add author attribution",
                description="No author/organization signal found. Add byline, author bio, or organization schema for authority signals.",
                priority=Priority.MEDIUM,
                category=Category.READABILITY,
                impact_score=6,
                effort=Effort.LOW,
            ))

        # read_06: Date published or modified present
        has_date = False
        for attr in ["article:published_time", "article:modified_time", "date", "pubdate"]:
            if soup.find("meta", attrs={"property": attr}) or soup.find("meta", attrs={"name": attr}):
                has_date = True
                break
        if soup.find("time"):
            has_date = True
        for script in soup.find_all("script", type="application/ld+json"):
            if script.string and ("datePublished" in script.string or "dateModified" in script.string):
                has_date = True
                break

        checks.append(Check(
            id="read_06",
            passed=has_date,
            text=f"Publication date: {'found' if has_date else 'not found'}",
            impact="Medium",
            category=Category.READABILITY,
        ))
        if has_date:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add publication date",
                description="No publish/update date found. Add visible dates and datePublished/dateModified schema for freshness signals.",
                priority=Priority.MEDIUM,
                category=Category.READABILITY,
                impact_score=6,
                effort=Effort.LOW,
            ))

        # read_07: Low hedging words
        text_lower = text.lower()
        hedging_count = sum(len(re.findall(r"\b" + w + r"\b", text_lower)) for w in HEDGING_WORDS)
        hedging_ok = hedging_count <= 5
        checks.append(Check(
            id="read_07",
            passed=hedging_ok,
            text=f"Hedging words: {hedging_count} found",
            impact="Low",
            category=Category.READABILITY,
        ))
        if hedging_ok:
            score += 8
        else:
            recommendations.append(Recommendation(
                title="Reduce hedging language",
                description=f"Content uses {hedging_count} hedging words. Replace with confident, direct statements for stronger authority signals.",
                priority=Priority.LOW,
                category=Category.READABILITY,
                impact_score=4,
                effort=Effort.LOW,
            ))

        # read_08: Clear conclusion or summary section
        has_conclusion = False
        for h in soup.find_all(["h2", "h3", "h4"]):
            heading_text = h.get_text(strip=True).lower()
            if any(kw in heading_text for kw in ["conclusion", "summary", "key takeaway", "final thought", "in summary", "wrapping up"]):
                has_conclusion = True
                break

        checks.append(Check(
            id="read_08",
            passed=has_conclusion,
            text=f"Conclusion section: {'found' if has_conclusion else 'not found'}",
            impact="Low",
            category=Category.READABILITY,
        ))
        if has_conclusion:
            score += 6
        else:
            recommendations.append(Recommendation(
                title="Add conclusion section",
                description="No conclusion or summary section detected. Add a summary paragraph to reinforce key points for AI extraction.",
                priority=Priority.LOW,
                category=Category.READABILITY,
                impact_score=3,
                effort=Effort.LOW,
            ))

        return ModuleResult(
            score=min(score, 100),
            checks=checks,
            recommendations=recommendations,
            details={
                "flesch_reading_ease": round(fre, 1),
                "avg_sentence_length": round(avg_sentence_length, 1),
                "passive_voice_pct": round(passive_pct, 1),
                "long_sentences": len(long_sentences),
                "hedging_words": hedging_count,
            },
        )
