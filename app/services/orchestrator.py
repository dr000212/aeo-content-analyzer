import asyncio
import time

from bs4 import BeautifulSoup

from app.analyzers.entity import EntityAnalyzer
from app.analyzers.readability import ReadabilityAnalyzer
from app.analyzers.schema import SchemaAnalyzer
from app.analyzers.structure import StructureAnalyzer
from app.models.request import AnalyzeOptions
from app.models.response import AnalyzeResponse, PageMeta
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

    page_meta = PageMeta(
        url=crawl_result.final_url,
        title=title,
        word_count=word_count,
        heading_count=len(headings),
        image_count=len(images),
        link_count=len(links["internal"]) + len(links["external"]),
        schema_types=schema_types,
        has_meta_description=bool(desc),
        meta_description_length=len(desc),
    )

    # Step 4: Run all 4 analyzers in parallel
    structure_analyzer = StructureAnalyzer()
    schema_analyzer = SchemaAnalyzer()
    entity_analyzer = EntityAnalyzer()
    readability_analyzer = ReadabilityAnalyzer()

    structure_result, schema_result, entity_result, readability_result = await asyncio.gather(
        structure_analyzer.analyze(soup, text, html),
        schema_analyzer.analyze(soup, text, html),
        entity_analyzer.analyze(soup, text, html),
        readability_analyzer.analyze(soup, text, html),
    )

    # Step 5: Calculate overall score
    overall_score, grade = scorer.calculate_overall(
        structure_result, schema_result, entity_result, readability_result
    )

    # Step 6: Aggregate recommendations
    all_checks = (
        structure_result.checks
        + schema_result.checks
        + entity_result.checks
        + readability_result.checks
    )
    recommendations = recommendation_engine.aggregate([
        structure_result, schema_result, entity_result, readability_result
    ])

    # Step 7: AI enhancement (optional, non-blocking)
    ai_recs = []
    ai_enhanced = False
    if options.include_ai_recommendations:
        ai_recs = await ai_enhancer.enhance(
            text=text,
            checks=all_checks,
            scores={
                "structure": structure_result.score,
                "schema": schema_result.score,
                "entity": entity_result.score,
                "readability": readability_result.score,
                "overall": overall_score,
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
        structure=structure_result,
        schema_markup=schema_result,
        entity=entity_result,
        readability=readability_result,
        checks=all_checks,
        recommendations=recommendations,
        ai_recommendations=ai_recs,
        ai_enhanced=ai_enhanced,
        meta=page_meta,
        analysis_time_ms=analysis_time_ms,
        cached=False,
    )

    # Cache the result
    await cache.set_cached(url, response)

    return response
