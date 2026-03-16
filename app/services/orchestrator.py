import asyncio
import time

from bs4 import BeautifulSoup

from app.analyzers.entity import EntityAnalyzer
from app.analyzers.link_analyzer import LinkAnalyzer
from app.analyzers.onpage_seo import OnPageSEOAnalyzer
from app.analyzers.performance import PerformanceAnalyzer
from app.analyzers.readability import ReadabilityAnalyzer
from app.analyzers.schema import SchemaAnalyzer
from app.analyzers.structure import StructureAnalyzer
from app.analyzers.technical_seo import TechnicalSEOAnalyzer
from app.models.request import AnalyzeOptions
from app.models.response import AnalyzeResponse, GEOResult, PageMeta
from app.services import ai_enhancer, cache, crawler, recommendation_engine, scorer
from app.utils.html_parser import (
    extract_headings,
    extract_images,
    extract_links,
    extract_meta_tags,
    extract_schema_json,
    extract_text,
)
from app.utils.text_utils import count_words


async def analyze(url: str, options: AnalyzeOptions) -> AnalyzeResponse:
    # Check cache first
    cached_result = await cache.get_cached(url)
    if cached_result:
        cached_result.cached = True
        return cached_result

    start = time.monotonic()

    # Step 1: Crawl
    crawl_result = await crawler.crawl(url)

    # Step 2: Parse HTML
    soup = BeautifulSoup(crawl_result.html, "lxml")
    text = extract_text(BeautifulSoup(crawl_result.html, "lxml"))  # Fresh soup since extract_text modifies it
    html = crawl_result.html

    # Step 3: Extract metadata
    headings = extract_headings(soup)
    images = extract_images(soup)
    links = extract_links(soup, crawl_result.final_url)
    meta_tags = extract_meta_tags(soup)
    schema_data = extract_schema_json(soup)
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else None
    word_count = count_words(text)

    schema_types = []
    for s in schema_data:
        t = s.get("@type", "")
        if isinstance(t, list):
            schema_types.extend(t)
        else:
            schema_types.append(t)

    desc = meta_tags.get("description", "")
    images_without_alt = sum(1 for img in images if not img.get("alt", "").strip())
    internal_count = len(links["internal"])
    external_count = len(links["external"])
    html_size_kb = round(len(html.encode("utf-8")) / 1024, 1)

    # Check for viewport and canonical
    has_viewport = soup.find("meta", attrs={"name": "viewport"}) is not None
    canonical = soup.find("link", rel="canonical")
    has_canonical = canonical is not None and bool(canonical.get("href", "").strip())
    is_https = crawl_result.final_url.startswith("https://")
    content_encoding = crawl_result.headers.get("content-encoding", "")
    has_compression = any(enc in content_encoding.lower() for enc in ("gzip", "br", "deflate"))

    # Count render-blocking resources
    head = soup.find("head")
    blocking_scripts = 0
    blocking_styles = 0
    if head:
        for script in head.find_all("script"):
            src = script.get("src", "")
            if src and not script.get("async") and not script.get("defer") and script.get("type") != "module":
                blocking_scripts += 1
        for link in head.find_all("link", rel="stylesheet"):
            media = link.get("media", "all")
            if media in ("all", "screen", ""):
                blocking_styles += 1

    page_meta = PageMeta(
        url=crawl_result.final_url,
        title=title,
        title_length=len(title) if title else 0,
        word_count=word_count,
        heading_count=len(headings),
        image_count=len(images),
        images_without_alt=images_without_alt,
        link_count=internal_count + external_count,
        internal_link_count=internal_count,
        external_link_count=external_count,
        broken_link_count=0,  # Updated from link analyzer
        schema_types=schema_types,
        has_meta_description=bool(desc),
        meta_description_length=len(desc),
        is_https=is_https,
        has_viewport=has_viewport,
        has_canonical=has_canonical,
        has_robots_txt=False,  # Updated from technical SEO analyzer
        html_size_kb=html_size_kb,
        load_time_ms=crawl_result.load_time_ms,
        has_compression=has_compression,
        render_blocking_scripts=blocking_scripts,
        render_blocking_styles=blocking_styles,
    )

    # Step 4: Run all 8 analyzers in parallel
    technical_seo_analyzer = TechnicalSEOAnalyzer()
    onpage_seo_analyzer = OnPageSEOAnalyzer()
    link_analyzer = LinkAnalyzer()
    performance_analyzer = PerformanceAnalyzer()
    structure_analyzer = StructureAnalyzer()
    schema_analyzer = SchemaAnalyzer()
    entity_analyzer = EntityAnalyzer()
    readability_analyzer = ReadabilityAnalyzer()

    (
        technical_seo_result,
        onpage_seo_result,
        link_result,
        performance_result,
        structure_result,
        schema_result,
        entity_result,
        readability_result,
    ) = await asyncio.gather(
        technical_seo_analyzer.analyze(soup, text, html, crawl_result=crawl_result),
        onpage_seo_analyzer.analyze(soup, text, html, url=crawl_result.final_url),
        link_analyzer.analyze(soup, text, html, base_url=crawl_result.final_url),
        performance_analyzer.analyze(soup, text, html, crawl_result=crawl_result),
        structure_analyzer.analyze(soup, text, html),
        schema_analyzer.analyze(soup, text, html),
        entity_analyzer.analyze(soup, text, html),
        readability_analyzer.analyze(soup, text, html),
    )

    # Update page_meta with data from analyzers
    if link_result.details.get("broken_link_count"):
        page_meta.broken_link_count = link_result.details["broken_link_count"]

    # Step 5: Calculate GEO sub-score
    geo_score = scorer.calculate_geo_score(
        structure_result, schema_result, entity_result, readability_result
    )

    # Build GEO result
    geo_checks = (
        structure_result.checks + schema_result.checks
        + entity_result.checks + readability_result.checks
    )
    geo_recs = recommendation_engine.aggregate([
        structure_result, schema_result, entity_result, readability_result
    ])
    geo_readiness = GEOResult(
        score=geo_score,
        structure=structure_result,
        schema_markup=schema_result,
        entity=entity_result,
        readability=readability_result,
        checks=geo_checks,
        recommendations=geo_recs,
    )

    # Step 6: Calculate overall SEO score (5 pillars)
    overall_score, grade = scorer.calculate_overall(
        technical_seo_result, onpage_seo_result, link_result, performance_result, geo_score
    )

    # Step 7: Aggregate all checks and recommendations from all 8 modules
    all_checks = (
        technical_seo_result.checks
        + onpage_seo_result.checks
        + link_result.checks
        + performance_result.checks
        + geo_checks
    )
    all_recommendations = recommendation_engine.aggregate([
        technical_seo_result, onpage_seo_result, link_result, performance_result,
        structure_result, schema_result, entity_result, readability_result,
    ])

    # Step 8: AI enhancement (optional, non-blocking)
    ai_recs = []
    ai_enhanced = False
    if options.include_ai_recommendations:
        ai_recs = await ai_enhancer.enhance(
            text=text,
            checks=all_checks,
            scores={
                "overall": overall_score,
                "technical_seo": technical_seo_result.score,
                "onpage_seo": onpage_seo_result.score,
                "links": link_result.score,
                "performance": performance_result.score,
                "geo": geo_score,
                "structure": structure_result.score,
                "schema": schema_result.score,
                "entity": entity_result.score,
                "readability": readability_result.score,
            },
            meta=page_meta,
        )
        ai_enhanced = len(ai_recs) > 0

    analysis_time_ms = int((time.monotonic() - start) * 1000)

    # Build response
    response = AnalyzeResponse(
        url=crawl_result.final_url,
        overall_score=overall_score,
        grade=grade,
        technical_seo=technical_seo_result,
        onpage_seo=onpage_seo_result,
        link_analysis=link_result,
        performance=performance_result,
        geo_readiness=geo_readiness,
        checks=all_checks,
        recommendations=all_recommendations,
        ai_recommendations=ai_recs,
        ai_enhanced=ai_enhanced,
        meta=page_meta,
        analysis_time_ms=analysis_time_ms,
        cached=False,
    )

    # Cache the result
    await cache.set_cached(url, response)

    return response
