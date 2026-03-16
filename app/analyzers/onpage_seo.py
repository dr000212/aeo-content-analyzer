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
from app.utils.html_parser import extract_headings, extract_images, extract_meta_tags
from app.utils.text_utils import get_primary_keyword

CATEGORY = Category.ONPAGE_SEO


class OnPageSEOAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str, **kwargs) -> ModuleResult:
        checks = []
        recommendations = []
        score = 0

        meta_tags = extract_meta_tags(soup)
        headings = extract_headings(soup)
        images = extract_images(soup)
        primary_keyword = get_primary_keyword(text)

        # opseo_01: Title tag exists
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        has_title = bool(title_text)
        checks.append(Check(
            id="opseo_01", passed=has_title,
            text=f"Title tag: {'found' if has_title else 'missing'}",
            impact="High", category=CATEGORY,
        ))
        if has_title:
            score += 14
        else:
            recommendations.append(Recommendation(
                title="Add title tag",
                description="Missing <title> tag. Every page needs a unique, descriptive title.",
                priority=Priority.CRITICAL, category=CATEGORY, impact_score=9, effort=Effort.LOW,
            ))

        # opseo_02: Title length 30-60 chars
        title_len = len(title_text)
        good_title_length = 30 <= title_len <= 60
        checks.append(Check(
            id="opseo_02", passed=good_title_length,
            text=f"Title length: {title_len} characters",
            impact="High", category=CATEGORY,
        ))
        if good_title_length:
            score += 12
        else:
            issue = "too short" if title_len < 30 else "too long"
            recommendations.append(Recommendation(
                title="Optimize title length",
                description=f"Title is {title_len} chars ({issue}). Target 30-60 characters for optimal display in search results.",
                priority=Priority.HIGH, category=CATEGORY, impact_score=7, effort=Effort.LOW,
            ))

        # opseo_03: Title contains primary keyword
        has_keyword_in_title = primary_keyword.lower() in title_text.lower() if primary_keyword else True
        checks.append(Check(
            id="opseo_03", passed=has_keyword_in_title,
            text=f"Title contains primary keyword: {'yes' if has_keyword_in_title else 'no'}",
            impact="Medium", category=CATEGORY,
        ))
        if has_keyword_in_title:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Add keyword to title",
                description=f"Title doesn't contain the primary topic keyword '{primary_keyword}'. Include it naturally.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.LOW,
            ))

        # opseo_04: Meta description exists
        desc = meta_tags.get("description", "")
        has_desc = bool(desc.strip())
        checks.append(Check(
            id="opseo_04", passed=has_desc,
            text=f"Meta description: {'found' if has_desc else 'missing'}",
            impact="High", category=CATEGORY,
        ))
        if has_desc:
            score += 14
        else:
            recommendations.append(Recommendation(
                title="Add meta description",
                description="Missing meta description. Add a compelling 120-160 character description.",
                priority=Priority.CRITICAL, category=CATEGORY, impact_score=8, effort=Effort.LOW,
            ))

        # opseo_05: Meta description length 120-160 chars
        desc_len = len(desc)
        good_desc_length = 120 <= desc_len <= 160 if has_desc else False
        checks.append(Check(
            id="opseo_05", passed=good_desc_length,
            text=f"Meta description length: {desc_len} characters",
            impact="Medium", category=CATEGORY,
        ))
        if good_desc_length:
            score += 8
        elif has_desc:
            issue = "too short" if desc_len < 120 else "too long"
            recommendations.append(Recommendation(
                title="Optimize meta description length",
                description=f"Meta description is {desc_len} chars ({issue}). Target 120-160 characters.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=5, effort=Effort.LOW,
            ))

        # opseo_06: SEO-friendly URL
        url = kwargs.get("url", "")
        is_seo_friendly = self._check_url_seo_friendly(url)
        checks.append(Check(
            id="opseo_06", passed=is_seo_friendly,
            text=f"SEO-friendly URL: {'yes' if is_seo_friendly else 'no'}",
            impact="Medium", category=CATEGORY,
        ))
        if is_seo_friendly:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Optimize URL structure",
                description="URL is not SEO-friendly. Use short, descriptive URLs with hyphens and lowercase letters.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=5, effort=Effort.HIGH,
            ))

        # opseo_07: All images have alt attributes
        total_images = len(images)
        images_without_alt = sum(1 for img in images if not img.get("alt", "").strip())
        all_have_alt = images_without_alt == 0 or total_images == 0
        checks.append(Check(
            id="opseo_07", passed=all_have_alt,
            text=f"Image alt text: {images_without_alt} of {total_images} missing alt text" if not all_have_alt else f"Image alt text: all {total_images} images have alt text",
            impact="Medium", category=CATEGORY,
        ))
        if all_have_alt:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Add image alt text",
                description=f"{images_without_alt} of {total_images} images missing alt text. Add descriptive alt attributes for accessibility and SEO.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.LOW,
            ))

        # opseo_08: Exactly one H1
        h1_tags = [h for h in headings if h["level"] == 1]
        h1_count = len(h1_tags)
        has_single_h1 = h1_count == 1
        checks.append(Check(
            id="opseo_08", passed=has_single_h1,
            text=f"Single H1 tag: {h1_count} H1 tag(s) found",
            impact="High", category=CATEGORY,
        ))
        if has_single_h1:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Fix H1 tag usage",
                description=f"{h1_count} H1 tags found. Use exactly one H1 per page for clear topic signaling.",
                priority=Priority.HIGH, category=CATEGORY, impact_score=7, effort=Effort.LOW,
            ))

        # opseo_09: H1 contains primary keyword
        h1_text = h1_tags[0]["text"].lower() if h1_tags else ""
        h1_has_keyword = primary_keyword.lower() in h1_text if primary_keyword and h1_text else (not primary_keyword)
        checks.append(Check(
            id="opseo_09", passed=h1_has_keyword,
            text=f"H1 contains primary keyword: {'yes' if h1_has_keyword else 'no'}",
            impact="Medium", category=CATEGORY,
        ))
        if h1_has_keyword:
            score += 8
        else:
            recommendations.append(Recommendation(
                title="Add keyword to H1",
                description=f"H1 doesn't contain the primary keyword '{primary_keyword}'. Include it naturally in the main heading.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=5, effort=Effort.LOW,
            ))

        # opseo_10: No empty heading tags
        all_heading_tags = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
        empty_headings = sum(1 for h in all_heading_tags if not h.get_text(strip=True))
        no_empty = empty_headings == 0
        checks.append(Check(
            id="opseo_10", passed=no_empty,
            text=f"Empty heading tags: {empty_headings} found" if not no_empty else "Empty heading tags: none found",
            impact="Low", category=CATEGORY,
        ))
        if no_empty:
            score += 4
        else:
            recommendations.append(Recommendation(
                title="Remove empty headings",
                description=f"{empty_headings} empty heading tags found. Remove or fill them with content.",
                priority=Priority.LOW, category=CATEGORY, impact_score=3, effort=Effort.LOW,
            ))

        score = max(0, min(100, score))
        return ModuleResult(score=score, checks=checks, recommendations=recommendations)

    def _check_url_seo_friendly(self, url: str) -> bool:
        if not url:
            return True
        from urllib.parse import urlparse
        parsed = urlparse(url)
        path = parsed.path

        if not path or path == "/":
            return True

        # Check for common SEO-unfriendly patterns
        has_uppercase = path != path.lower()
        has_underscores = "_" in path
        has_query_params = bool(parsed.query) and len(parsed.query) > 50
        has_file_extension = bool(re.search(r'\.(php|asp|aspx|jsp|cgi)\b', path, re.I))
        too_long = len(path) > 115

        issues = sum([has_uppercase, has_underscores, has_query_params, has_file_extension, too_long])
        return issues == 0
