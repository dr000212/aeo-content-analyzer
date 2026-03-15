import pytest
from app.analyzers.entity import EntityAnalyzer


@pytest.mark.asyncio
async def test_good_page_entity_analysis(good_soup, good_text, good_html):
    analyzer = EntityAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    assert result.score >= 30
    # Should detect named entities
    ent_check = next(c for c in result.checks if c.id == "ent_01")
    assert ent_check.category.value == "Entity"


@pytest.mark.asyncio
async def test_bad_page_low_entities(bad_soup, bad_text, bad_html):
    analyzer = EntityAnalyzer()
    result = await analyzer.analyze(bad_soup, bad_text, bad_html)

    # Bad page has minimal entity coverage
    assert result.score < 60
    assert len(result.recommendations) > 0


@pytest.mark.asyncio
async def test_details_contain_expected_keys(good_soup, good_text, good_html):
    analyzer = EntityAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    assert "entity_count" in result.details
    assert "primary_keyword" in result.details
    assert "keyword_density" in result.details
