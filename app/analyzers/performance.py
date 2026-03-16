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
from app.utils.html_parser import extract_images

CATEGORY = Category.PERFORMANCE


class PerformanceAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str, **kwargs) -> ModuleResult:
        checks = []
        recommendations = []
        score = 0

        crawl_result = kwargs.get("crawl_result")
        load_time_ms = crawl_result.load_time_ms if crawl_result else 0
        headers = crawl_result.headers if crawl_result else {}
        images = extract_images(soup)

        # perf_01: Page load time < 3 seconds
        fast_load = load_time_ms < 3000
        checks.append(Check(
            id="perf_01", passed=fast_load,
            text=f"Page load time: {load_time_ms}ms",
            impact="High", category=CATEGORY,
        ))
        if fast_load:
            score += 18
        else:
            recommendations.append(Recommendation(
                title="Improve page load time",
                description=f"Page took {load_time_ms}ms to load (target: <3000ms). Optimize server response, reduce payload, and enable caching.",
                priority=Priority.CRITICAL, category=CATEGORY, impact_score=9, effort=Effort.HIGH,
            ))

        # perf_02: HTML size < 100KB
        html_size_kb = round(len(html.encode("utf-8")) / 1024, 1)
        small_html = html_size_kb < 100
        checks.append(Check(
            id="perf_02", passed=small_html,
            text=f"HTML size: {html_size_kb}KB",
            impact="Medium", category=CATEGORY,
        ))
        if small_html:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Reduce HTML size",
                description=f"HTML is {html_size_kb}KB (target: <100KB). Minify HTML and reduce DOM complexity.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.MEDIUM,
            ))

        # perf_03: No more than 5 render-blocking scripts in <head>
        head = soup.find("head")
        blocking_scripts = 0
        if head:
            for script in head.find_all("script"):
                src = script.get("src", "")
                is_async = script.get("async") is not None
                is_defer = script.get("defer") is not None
                is_module = script.get("type") == "module"
                if src and not is_async and not is_defer and not is_module:
                    blocking_scripts += 1
        few_blocking_scripts = blocking_scripts <= 5
        checks.append(Check(
            id="perf_03", passed=few_blocking_scripts,
            text=f"Render-blocking scripts: {blocking_scripts}",
            impact="High", category=CATEGORY,
        ))
        if few_blocking_scripts:
            score += 16
        else:
            recommendations.append(Recommendation(
                title="Reduce render-blocking scripts",
                description=f"{blocking_scripts} render-blocking scripts in <head>. Add async/defer attributes or move scripts to end of body.",
                priority=Priority.HIGH, category=CATEGORY, impact_score=8, effort=Effort.MEDIUM,
            ))

        # perf_04: No more than 3 render-blocking stylesheets
        blocking_styles = 0
        if head:
            for link in head.find_all("link", rel="stylesheet"):
                media = link.get("media", "all")
                if media in ("all", "screen", ""):
                    blocking_styles += 1
        few_blocking_styles = blocking_styles <= 3
        checks.append(Check(
            id="perf_04", passed=few_blocking_styles,
            text=f"Render-blocking stylesheets: {blocking_styles}",
            impact="Medium", category=CATEGORY,
        ))
        if few_blocking_styles:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Reduce render-blocking stylesheets",
                description=f"{blocking_styles} render-blocking stylesheets found. Inline critical CSS or combine stylesheets.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.MEDIUM,
            ))

        # perf_05: Images have width/height attributes
        total_images = len(images)
        missing_dimensions = sum(1 for img in images if not img.get("has_dimensions"))
        has_dimensions = missing_dimensions == 0 or total_images == 0
        checks.append(Check(
            id="perf_05", passed=has_dimensions,
            text=f"Image dimensions: {missing_dimensions} of {total_images} missing" if not has_dimensions else f"Image dimensions: all {total_images} images have dimensions",
            impact="Medium", category=CATEGORY,
        ))
        if has_dimensions:
            score += 12
        else:
            recommendations.append(Recommendation(
                title="Add image dimensions",
                description=f"{missing_dimensions} of {total_images} images missing width/height attributes. Add them to prevent Cumulative Layout Shift (CLS).",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=6, effort=Effort.LOW,
            ))

        # perf_06: Images use lazy loading
        below_fold_images = images[3:]  # First few images should not be lazy
        missing_lazy = sum(1 for img in below_fold_images if not img.get("has_lazy_loading"))
        has_lazy = missing_lazy == 0 or len(below_fold_images) == 0
        checks.append(Check(
            id="perf_06", passed=has_lazy,
            text=f"Lazy loading: {missing_lazy} images could benefit" if not has_lazy else "Lazy loading: properly configured",
            impact="Medium", category=CATEGORY,
        ))
        if has_lazy:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Add lazy loading to images",
                description=f'{missing_lazy} below-the-fold images could benefit from loading="lazy" to improve initial page load.',
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=5, effort=Effort.LOW,
            ))

        # perf_07: Inline styles < 5KB total
        inline_style_size = 0
        for style in soup.find_all("style"):
            inline_style_size += len(style.get_text())
        for tag in soup.find_all(style=True):
            inline_style_size += len(tag.get("style", ""))
        inline_kb = round(inline_style_size / 1024, 1)
        small_inline = inline_kb < 5
        checks.append(Check(
            id="perf_07", passed=small_inline,
            text=f"Inline styles: {inline_kb}KB",
            impact="Low", category=CATEGORY,
        ))
        if small_inline:
            score += 6
        else:
            recommendations.append(Recommendation(
                title="Reduce inline styles",
                description=f"{inline_kb}KB of inline styles found. Move styles to an external stylesheet for better caching.",
                priority=Priority.LOW, category=CATEGORY, impact_score=3, effort=Effort.MEDIUM,
            ))

        # perf_08: Uses gzip/brotli compression
        content_encoding = headers.get("content-encoding", "")
        has_compression = any(enc in content_encoding.lower() for enc in ("gzip", "br", "deflate"))
        checks.append(Check(
            id="perf_08", passed=has_compression,
            text=f"Compression: {'enabled ({})'.format(content_encoding) if has_compression else 'not detected'}",
            impact="Medium", category=CATEGORY,
        ))
        if has_compression:
            score += 14
        else:
            recommendations.append(Recommendation(
                title="Enable compression",
                description="Page is not using gzip/brotli compression. Enable it for 60-80% smaller transfers.",
                priority=Priority.MEDIUM, category=CATEGORY, impact_score=7, effort=Effort.LOW,
            ))

        score = max(0, min(100, score))
        return ModuleResult(
            score=score, checks=checks, recommendations=recommendations,
            details={
                "load_time_ms": load_time_ms,
                "html_size_kb": html_size_kb,
                "render_blocking_scripts": blocking_scripts,
                "render_blocking_styles": blocking_styles,
                "has_compression": has_compression,
            },
        )
