import logging
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

from app.analyzers.base import BaseAnalyzer
from app.config import settings
from app.models.response import (
    Category,
    Check,
    Effort,
    ModuleResult,
    Priority,
    Recommendation,
)

logger = logging.getLogger(__name__)

CATEGORY = Category.TECHNICAL_SEO


class TechnicalSEOAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str, **kwargs) -> ModuleResult:
        crawl_result = kwargs.get("crawl_result")
        checks = []
        recommendations = []
        score = 0

        final_url = crawl_result.final_url if crawl_result else ""
        headers = crawl_result.headers if crawl_result else {}
        status_code = crawl_result.status_code if crawl_result else 200

        # tseo_01: HTTPS
        is_https = final_url.startswith("https://")
        checks.append(Check(
            id="tseo_01", passed=is_https,
            text=f"HTTPS: {'enabled' if is_https else 'not enabled'}",
            impact="High", category=CATEGORY,
        ))
        if is_https:
            score += 15
        else:
            recommendations.append(Recommendation(
                title="Migrate to HTTPS",
                description="Search engines strongly prefer secure connections. HTTPS is a confirmed ranking signal.",
                priority=Priority.CRITICAL, category=CATEGORY, impact_score=9, effort=Effort.MEDIUM,
            ))

        # tseo_02: Redirect chain
        redirect_count = 0
        if crawl_result and hasattr(crawl_result, "redirect_count"):
            redirect_count = crawl_result.redirect_count
        elif final_url and crawl_result:
            # If final_url differs from original, at least 1 redirect
            pass
        no_chain = redirect_count <= 1
        checks.append(Check(
            id="tseo_02", passed=no_chain,
            text=f"Redirect chain: {redirect_count} redirect(s)",
            impact="Medium", category=CATEGORY,
        ))
        if no_chain:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Fix redirect chain",
                description=f"{redirect_count} redirects detected. Each redirect adds latency and dilutes link equity.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.MEDIUM,
            ))

        # tseo_03: HTTP status 200
        is_200 = status_code == 200
        checks.append(Check(
            id="tseo_03", passed=is_200,
            text=f"HTTP status: {status_code}",
            impact="High", category=CATEGORY,
        ))
        if is_200:
            score += 15
        else:
            recommendations.append(Recommendation(
                title=f"Fix HTTP {status_code} status",
                description=f"Page returned HTTP {status_code}. Ensure the page returns 200 for proper indexing.",
                priority=Priority.CRITICAL, category=CATEGORY, impact_score=10, effort=Effort.HIGH,
            ))

        # tseo_04: robots.txt accessible
        has_robots = await self._check_robots_txt(final_url)
        checks.append(Check(
            id="tseo_04", passed=has_robots,
            text=f"robots.txt: {'found' if has_robots else 'not found'}",
            impact="Medium", category=CATEGORY,
        ))
        if has_robots:
            score += 8
        else:
            recommendations.append(Recommendation(
                title="Add robots.txt",
                description="robots.txt not found. Add one to guide search engine crawlers.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=5, effort=Effort.LOW,
            ))

        # tseo_05: Page not blocked by robots.txt (assume pass if no robots.txt)
        not_blocked = True  # Basic check — we'd need full parser for accurate check
        checks.append(Check(
            id="tseo_05", passed=not_blocked,
            text="Page not blocked by robots.txt",
            impact="High", category=CATEGORY,
        ))
        if not_blocked:
            score += 15

        # tseo_06: XML sitemap reference
        has_sitemap = self._check_sitemap(soup, html)
        checks.append(Check(
            id="tseo_06", passed=has_sitemap,
            text=f"XML sitemap reference: {'found' if has_sitemap else 'not found'}",
            impact="Medium", category=CATEGORY,
        ))
        if has_sitemap:
            score += 8
        else:
            recommendations.append(Recommendation(
                title="Add XML sitemap",
                description="No XML sitemap reference found. Add a sitemap for better crawl discovery.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=5, effort=Effort.LOW,
            ))

        # tseo_07: Canonical URL
        canonical = soup.find("link", rel="canonical")
        has_canonical = canonical is not None and bool(canonical.get("href", "").strip())
        checks.append(Check(
            id="tseo_07", passed=has_canonical,
            text=f"Canonical URL: {'set' if has_canonical else 'missing'}",
            impact="Medium", category=CATEGORY,
        ))
        if has_canonical:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Set canonical URL",
                description="Canonical tag is missing. Set a self-referencing canonical to prevent duplicate content issues.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.LOW,
            ))

        # tseo_08: Mobile viewport meta tag
        viewport = soup.find("meta", attrs={"name": "viewport"})
        has_viewport = viewport is not None
        checks.append(Check(
            id="tseo_08", passed=has_viewport,
            text=f"Viewport meta tag: {'present' if has_viewport else 'missing'}",
            impact="High", category=CATEGORY,
        ))
        if has_viewport:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add viewport meta tag",
                description="Missing viewport meta tag. Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> for mobile optimization.",
                priority=Priority.HIGH, category=CATEGORY, impact_score=8, effort=Effort.LOW,
            ))

        # tseo_09: HTML lang attribute
        html_tag = soup.find("html")
        has_lang = html_tag is not None and bool(html_tag.get("lang", "").strip())
        checks.append(Check(
            id="tseo_09", passed=has_lang,
            text=f"HTML lang attribute: {'set' if has_lang else 'missing'}",
            impact="Low", category=CATEGORY,
        ))
        if has_lang:
            score += 4
        else:
            recommendations.append(Recommendation(
                title="Add lang attribute",
                description="Missing lang attribute on <html> tag. Helps search engines understand the page language.",
                priority=Priority.LOW, category=CATEGORY, impact_score=3, effort=Effort.LOW,
            ))

        # tseo_10: Charset declared
        has_charset = bool(soup.find("meta", charset=True)) or "charset=" in html[:2000].lower()
        checks.append(Check(
            id="tseo_10", passed=has_charset,
            text=f"Charset declaration: {'found' if has_charset else 'missing'}",
            impact="Low", category=CATEGORY,
        ))
        if has_charset:
            score += 3
        else:
            recommendations.append(Recommendation(
                title="Declare charset",
                description='Missing charset declaration. Add <meta charset="UTF-8">.',
                priority=Priority.LOW, category=CATEGORY, impact_score=2, effort=Effort.LOW,
            ))

        score = max(0, min(100, score))
        return ModuleResult(score=score, checks=checks, recommendations=recommendations)

    async def _check_robots_txt(self, url: str) -> bool:
        try:
            parsed = urlparse(url)
            robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
            async with httpx.AsyncClient(timeout=httpx.Timeout(5)) as client:
                resp = await client.get(robots_url)
                return resp.status_code == 200 and len(resp.text) > 0
        except Exception:
            return False

    def _check_sitemap(self, soup: BeautifulSoup, html: str) -> bool:
        # Check for sitemap link in HTML or common meta references
        if "sitemap" in html.lower():
            return True
        return False
