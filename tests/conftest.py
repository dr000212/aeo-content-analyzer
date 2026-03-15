import os
import pytest
from bs4 import BeautifulSoup


FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


@pytest.fixture
def good_html():
    with open(os.path.join(FIXTURES_DIR, "sample_good.html"), "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def bad_html():
    with open(os.path.join(FIXTURES_DIR, "sample_bad.html"), "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def good_soup(good_html):
    return BeautifulSoup(good_html, "lxml")


@pytest.fixture
def bad_soup(bad_html):
    return BeautifulSoup(bad_html, "lxml")


@pytest.fixture
def good_text(good_html):
    from app.utils.html_parser import extract_text
    return extract_text(BeautifulSoup(good_html, "lxml"))


@pytest.fixture
def bad_text(bad_html):
    from app.utils.html_parser import extract_text
    return extract_text(BeautifulSoup(bad_html, "lxml"))
