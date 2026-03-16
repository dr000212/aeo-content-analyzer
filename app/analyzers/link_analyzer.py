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
from app.utils.html_parser import extract_links
from app.utils.text_utils import count_words

CATEGORY = Category.LINKS

GENERIC_ANCHORS = {"click here", "here", "read more", "learn more", "more", "link", "this"}


class LinkAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str, **kwargs) -> ModuleResult:
        checks = []
        recommendations = []
        score = 0

        base_url = kwargs.get("base_url", "")
        links = extract_links(soup, base_url)
        internal_links = links["internal"]
        external_links = links["external"]

        all_a_tags = soup.find_all("a", href=True)

        # link_01: Has at least 3 internal links
        internal_count = len(internal_links)
        has_enough_internal = internal_count >= 3
        checks.append(Check(
            id="link_01", passed=has_enough_internal,
            text=f"Internal links: {internal_count} found",
            impact="High", category=CATEGORY,
        ))
        if has_enough_internal:
            score += 20
        else:
            recommendations.append(Recommendation(
                title="Add internal links",
                description=f"Only {internal_count} internal links. Add 3+ to improve crawlability and distribute page authority.",
                priority=Priority.HIGH, category=CATEGORY, impact_score=8, effort=Effort.MEDIUM,
            ))

        # link_02: Has at least 1 external link
        external_count = len(external_links)
        has_external = external_count >= 1
        checks.append(Check(
            id="link_02", passed=has_external,
            text=f"External links: {external_count} found",
            impact="Medium", category=CATEGORY,
        ))
        if has_external:
            score += 15
        else:
            recommendations.append(Recommendation(
                title="Add external links",
                description="No external links found. Link to authoritative sources to build trust signals.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.LOW,
            ))

        # link_03: No broken links (empty href, #, javascript:void)
        broken_count = 0
        for a in all_a_tags:
            href = a.get("href", "").strip()
            if not href or href == "#" or href.startswith("javascript:"):
                broken_count += 1
        no_broken = broken_count == 0
        checks.append(Check(
            id="link_03", passed=no_broken,
            text=f"Broken/empty links: {broken_count} found" if not no_broken else "Broken/empty links: none found",
            impact="Medium", category=CATEGORY,
        ))
        if no_broken:
            score += 18
        else:
            recommendations.append(Recommendation(
                title="Fix broken links",
                description=f"{broken_count} broken or empty links found. Fix or remove them to improve user experience.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.LOW,
            ))

        # link_04: External links with target="_blank" have rel="noopener"
        missing_noopener = 0
        for link in external_links:
            if link.get("target") == "_blank":
                rel = link.get("rel", [])
                if "noopener" not in rel and "noreferrer" not in rel:
                    missing_noopener += 1
        has_noopener = missing_noopener == 0
        checks.append(Check(
            id="link_04", passed=has_noopener,
            text=f'External links with rel="noopener": {missing_noopener} missing' if not has_noopener else 'External links with rel="noopener": all set',
            impact="Low", category=CATEGORY,
        ))
        if has_noopener:
            score += 8
        else:
            recommendations.append(Recommendation(
                title='Add rel="noopener" to external links',
                description=f'{missing_noopener} external links opening in new tabs are missing rel="noopener". Add it for security.',
                priority=Priority.LOW, category=CATEGORY, impact_score=3, effort=Effort.LOW,
            ))

        # link_05: Descriptive anchor text
        generic_count = 0
        for a in all_a_tags:
            anchor = a.get_text(strip=True).lower()
            if anchor in GENERIC_ANCHORS:
                generic_count += 1
        descriptive_anchors = generic_count == 0
        checks.append(Check(
            id="link_05", passed=descriptive_anchors,
            text=f"Generic anchor text: {generic_count} links" if not descriptive_anchors else "Anchor text: all descriptive",
            impact="Medium", category=CATEGORY,
        ))
        if descriptive_anchors:
            score += 15
        else:
            recommendations.append(Recommendation(
                title="Use descriptive anchor text",
                description=f'{generic_count} links use generic anchor text like "click here". Use descriptive text that tells users and search engines what the link is about.',
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=5, effort=Effort.LOW,
            ))

        # link_06: Link-to-text ratio (< 1 link per 50 words)
        word_count = count_words(text)
        total_links = len(all_a_tags)
        ratio_per_100 = round(total_links / max(word_count, 1) * 100, 1)
        reasonable_ratio = ratio_per_100 <= 2.0  # ~1 link per 50 words
        checks.append(Check(
            id="link_06", passed=reasonable_ratio,
            text=f"Link density: {ratio_per_100} links per 100 words",
            impact="Low", category=CATEGORY,
        ))
        if reasonable_ratio:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Reduce link density",
                description=f"Link density is too high ({ratio_per_100} per 100 words). Reduce the number of links for better readability.",
                priority=Priority.LOW, category=CATEGORY, impact_score=4, effort=Effort.MEDIUM,
            ))

        # link_07: No links to blocked/noindex pages
        nofollow_links = 0
        for a in all_a_tags:
            rel = a.get("rel", [])
            if isinstance(rel, str):
                rel = [rel]
            if "nofollow" in rel:
                nofollow_links += 1
        # Check is lenient — just flag if many nofollow internal links
        reasonable_nofollow = nofollow_links <= max(total_links * 0.3, 2)
        checks.append(Check(
            id="link_07", passed=reasonable_nofollow,
            text=f"Nofollow links: {nofollow_links} of {total_links}" if not reasonable_nofollow else "Link follow signals: healthy",
            impact="Low", category=CATEGORY,
        ))
        if reasonable_nofollow:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Review nofollow links",
                description=f"Found {nofollow_links} nofollow links. Ensure internal links pass link equity where appropriate.",
                priority=Priority.LOW, category=CATEGORY, impact_score=4, effort=Effort.LOW,
            ))

        score = max(0, min(100, score))
        return ModuleResult(
            score=score, checks=checks, recommendations=recommendations,
            details={
                "internal_link_count": internal_count,
                "external_link_count": external_count,
                "broken_link_count": broken_count,
            },
        )
