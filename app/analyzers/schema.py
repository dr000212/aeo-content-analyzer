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
from app.utils.html_parser import extract_meta_tags, extract_schema_json


class SchemaAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str) -> ModuleResult:
        checks: list[Check] = []
        recommendations: list[Recommendation] = []
        score = 0

        schemas = extract_schema_json(soup)
        meta = extract_meta_tags(soup)
        schema_types = []
        for s in schemas:
            t = s.get("@type", "")
            if isinstance(t, list):
                schema_types.extend(t)
            else:
                schema_types.append(t)

        # sch_01: JSON-LD structured data exists
        has_jsonld = len(schemas) > 0
        checks.append(Check(
            id="sch_01",
            passed=has_jsonld,
            text=f"JSON-LD structured data: {'found' if has_jsonld else 'not found'}",
            impact="High",
            category=Category.SCHEMA,
        ))
        if has_jsonld:
            score += 20
        else:
            recommendations.append(Recommendation(
                title="Add JSON-LD structured data",
                description="Implement Article or WebPage schema with author, datePublished, and organization.",
                priority=Priority.HIGH,
                category=Category.SCHEMA,
                impact_score=9,
                effort=Effort.MEDIUM,
            ))

        # sch_02: FAQPage schema
        has_faq_schema = "FAQPage" in schema_types
        # Count question-format headings for the recommendation
        question_headings = len([
            h for h in soup.find_all(["h2", "h3"])
            if re.match(r"^(what|how|why|when|where|who|is|can|does)\b", h.get_text(strip=True), re.I)
        ])
        checks.append(Check(
            id="sch_02",
            passed=has_faq_schema,
            text=f"FAQPage schema: {'found' if has_faq_schema else 'not found'}",
            impact="High",
            category=Category.SCHEMA,
        ))
        if has_faq_schema:
            score += 20
        else:
            recommendations.append(Recommendation(
                title="Implement FAQ schema",
                description=f"{question_headings} question-format headings detected. Wrap Q&A pairs in FAQPage JSON-LD.",
                priority=Priority.HIGH,
                category=Category.SCHEMA,
                impact_score=9,
                effort=Effort.MEDIUM,
            ))

        # sch_03: HowTo schema
        has_howto = "HowTo" in schema_types
        # Detect step-by-step content
        has_ordered_list = bool(soup.find("ol"))
        step_pattern = bool(re.search(r"step\s*\d|step\s+\d", text, re.I))
        likely_howto = has_ordered_list or step_pattern
        checks.append(Check(
            id="sch_03",
            passed=has_howto,
            text=f"HowTo schema: {'found' if has_howto else 'not found'}",
            impact="Medium",
            category=Category.SCHEMA,
        ))
        if has_howto:
            score += 12
        elif likely_howto:
            recommendations.append(Recommendation(
                title="Add HowTo schema",
                description="Step-by-step content detected. Wrap instructions in HowTo structured data.",
                priority=Priority.MEDIUM,
                category=Category.SCHEMA,
                impact_score=7,
                effort=Effort.MEDIUM,
            ))

        # sch_04: Speakable schema
        has_speakable = "Speakable" in schema_types or any(
            "speakable" in str(s).lower() for s in schemas
        )
        checks.append(Check(
            id="sch_04",
            passed=has_speakable,
            text=f"Speakable schema: {'found' if has_speakable else 'not found'}",
            impact="Medium",
            category=Category.SCHEMA,
        ))
        if has_speakable:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add Speakable schema",
                description="Mark key answer sections for voice assistant responses.",
                priority=Priority.MEDIUM,
                category=Category.SCHEMA,
                impact_score=6,
                effort=Effort.MEDIUM,
            ))

        # sch_05: OpenGraph tags complete
        required_og = ["og:title", "og:description", "og:image", "og:type"]
        missing_og = [t for t in required_og if t not in meta]
        has_complete_og = len(missing_og) == 0
        checks.append(Check(
            id="sch_05",
            passed=has_complete_og,
            text=f"OpenGraph tags: {'complete' if has_complete_og else f'missing {missing_og}'}",
            impact="Medium",
            category=Category.SCHEMA,
        ))
        if has_complete_og:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Complete OpenGraph tags",
                description=f"Missing: {', '.join(missing_og)}.",
                priority=Priority.MEDIUM,
                category=Category.SCHEMA,
                impact_score=6,
                effort=Effort.LOW,
            ))

        # sch_06: Twitter Card meta tags
        twitter_tags = [k for k in meta if k.startswith("twitter:")]
        has_twitter = len(twitter_tags) > 0
        checks.append(Check(
            id="sch_06",
            passed=has_twitter,
            text=f"Twitter Card tags: {'found' if has_twitter else 'not found'}",
            impact="Low",
            category=Category.SCHEMA,
        ))
        if has_twitter:
            score += 6
        else:
            recommendations.append(Recommendation(
                title="Add Twitter Card meta tags",
                description="Add Twitter Card meta tags for better social and AI discovery.",
                priority=Priority.LOW,
                category=Category.SCHEMA,
                impact_score=3,
                effort=Effort.LOW,
            ))

        # sch_07: Meta description exists and is 120-160 chars
        desc = meta.get("description", "")
        desc_len = len(desc)
        desc_ok = 120 <= desc_len <= 160
        if not desc:
            desc_issue = "missing"
        elif desc_len < 120:
            desc_issue = f"too short ({desc_len} chars)"
        elif desc_len > 160:
            desc_issue = f"too long ({desc_len} chars)"
        else:
            desc_issue = "good"

        checks.append(Check(
            id="sch_07",
            passed=desc_ok,
            text=f"Meta description: {desc_issue}",
            impact="Medium",
            category=Category.SCHEMA,
        ))
        if desc_ok:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Fix meta description",
                description=f"Meta description is {desc_issue}. Target 120-160 characters with primary keyword.",
                priority=Priority.MEDIUM,
                category=Category.SCHEMA,
                impact_score=7,
                effort=Effort.LOW,
            ))

        # sch_08: Canonical URL is set
        canonical = soup.find("link", rel="canonical")
        has_canonical = canonical is not None
        checks.append(Check(
            id="sch_08",
            passed=has_canonical,
            text=f"Canonical URL: {'set' if has_canonical else 'not set'}",
            impact="Low",
            category=Category.SCHEMA,
        ))
        if has_canonical:
            score += 6
        else:
            recommendations.append(Recommendation(
                title="Add canonical URL",
                description="Add canonical URL tag to prevent duplicate content issues.",
                priority=Priority.LOW,
                category=Category.SCHEMA,
                impact_score=3,
                effort=Effort.LOW,
            ))

        return ModuleResult(
            score=min(score, 100),
            checks=checks,
            recommendations=recommendations,
            details={
                "schema_types": schema_types,
                "og_tags": {k: v for k, v in meta.items() if k.startswith("og:")},
                "twitter_tags": {k: v for k, v in meta.items() if k.startswith("twitter:")},
                "meta_description_length": desc_len,
            },
        )
