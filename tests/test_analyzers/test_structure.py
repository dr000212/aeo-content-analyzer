import pytest
from app.analyzers.structure import StructureAnalyzer


@pytest.mark.asyncio
async def test_good_page_scores_high(good_soup, good_text, good_html):
    analyzer = StructureAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    assert result.score >= 60
    # Should have single H1
    h1_check = next(c for c in result.checks if c.id == "str_01")
    assert h1_check.passed is True


@pytest.mark.asyncio
async def test_bad_page_scores_low(bad_soup, bad_text, bad_html):
    analyzer = StructureAnalyzer()
    result = await analyzer.analyze(bad_soup, bad_text, bad_html)

    assert result.score < 50
    # Multiple H1s should fail
    h1_check = next(c for c in result.checks if c.id == "str_01")
    assert h1_check.passed is False
    # Should have recommendations
    assert len(result.recommendations) > 0


@pytest.mark.asyncio
async def test_heading_hierarchy_check(good_soup, good_text, good_html):
    analyzer = StructureAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    hierarchy_check = next(c for c in result.checks if c.id == "str_02")
    assert hierarchy_check.passed is True


@pytest.mark.asyncio
async def test_question_headings_detected(good_soup, good_text, good_html):
    analyzer = StructureAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    q_check = next(c for c in result.checks if c.id == "str_05")
    assert q_check.passed is True
