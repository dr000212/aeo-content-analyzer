import pytest
from app.analyzers.readability import ReadabilityAnalyzer


@pytest.mark.asyncio
async def test_good_page_readability(good_soup, good_text, good_html):
    analyzer = ReadabilityAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    assert result.score >= 30
    # Should have author detection
    author_check = next(c for c in result.checks if c.id == "read_05")
    assert author_check.passed is True
    # Should have date
    date_check = next(c for c in result.checks if c.id == "read_06")
    assert date_check.passed is True


@pytest.mark.asyncio
async def test_bad_page_readability(bad_soup, bad_text, bad_html):
    analyzer = ReadabilityAnalyzer()
    result = await analyzer.analyze(bad_soup, bad_text, bad_html)

    # Bad page has hedging words and no author/date
    author_check = next(c for c in result.checks if c.id == "read_05")
    assert author_check.passed is False
    assert len(result.recommendations) > 0


@pytest.mark.asyncio
async def test_conclusion_detection(good_soup, good_text, good_html):
    analyzer = ReadabilityAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    conclusion_check = next(c for c in result.checks if c.id == "read_08")
    assert conclusion_check.passed is True


@pytest.mark.asyncio
async def test_details_contain_metrics(good_soup, good_text, good_html):
    analyzer = ReadabilityAnalyzer()
    result = await analyzer.analyze(good_soup, good_text, good_html)

    assert "flesch_reading_ease" in result.details
    assert "avg_sentence_length" in result.details
    assert "passive_voice_pct" in result.details
