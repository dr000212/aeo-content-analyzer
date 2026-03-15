import pytest
from app.analyzers.schema import SchemaAnalyzer


@pytest.mark.asyncio
async def test_good_page_has_schema(good_soup, good_text, good_html):
    analyzer = SchemaAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    assert result.score >= 60
    # JSON-LD should be detected
    jsonld_check = next(c for c in result.checks if c.id == "sch_01")
    assert jsonld_check.passed is True
    # FAQ schema should be detected
    faq_check = next(c for c in result.checks if c.id == "sch_02")
    assert faq_check.passed is True


@pytest.mark.asyncio
async def test_bad_page_missing_schema(bad_soup, bad_text, bad_html):
    analyzer = SchemaAnalyzer()
    result = await analyzer.analyze(bad_soup, bad_text, bad_html)

    assert result.score < 20
    jsonld_check = next(c for c in result.checks if c.id == "sch_01")
    assert jsonld_check.passed is False
    assert len(result.recommendations) > 0


@pytest.mark.asyncio
async def test_og_tags_detected(good_soup, good_text, good_html):
    analyzer = SchemaAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    og_check = next(c for c in result.checks if c.id == "sch_05")
    assert og_check.passed is True


@pytest.mark.asyncio
async def test_meta_description_check(good_soup, good_text, good_html):
    analyzer = SchemaAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    meta_check = next(c for c in result.checks if c.id == "sch_07")
    # The sample_good.html has a meta description
    assert meta_check.category.value == "Schema"
