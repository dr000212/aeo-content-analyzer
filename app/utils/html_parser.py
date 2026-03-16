import json
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup, Comment


def extract_text(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "aside"]):
        tag.decompose()
    for comment in soup.find_all(string=lambda t: isinstance(t, Comment)):
        comment.extract()
    text = soup.get_text(separator=" ", strip=True)
    return " ".join(text.split())


def extract_headings(soup: BeautifulSoup) -> list[dict]:
    all_heading_tags = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
    headings = []
    for tag in all_heading_tags:
        text = tag.get_text(strip=True)
        if text:
            level = int(tag.name[1])
            headings.append({"level": level, "text": text})
    return headings


def extract_paragraphs(soup: BeautifulSoup) -> list[str]:
    paragraphs = []
    for p in soup.find_all("p"):
        text = p.get_text(strip=True)
        if text:
            paragraphs.append(text)
    return paragraphs


def extract_links(soup: BeautifulSoup, base_url: str) -> dict:
    internal = []
    external = []
    base_domain = urlparse(base_url).netloc

    for a in soup.find_all("a", href=True):
        href = a["href"]
        anchor_text = a.get_text(strip=True)
        rel = a.get("rel", [])
        if isinstance(rel, str):
            rel = [rel]
        target = a.get("target", "")
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)

        link_info = {
            "url": full_url,
            "href": href,
            "anchor_text": anchor_text,
            "rel": rel,
            "target": target,
        }

        if not parsed.scheme.startswith("http"):
            continue

        if parsed.netloc == base_domain:
            internal.append(link_info)
        else:
            external.append(link_info)

    return {"internal": internal, "external": external}


def extract_images(soup: BeautifulSoup) -> list[dict]:
    images = []
    for img in soup.find_all("img"):
        images.append({
            "src": img.get("src", ""),
            "alt": img.get("alt", ""),
            "has_dimensions": bool(img.get("width") or img.get("height")),
            "has_lazy_loading": img.get("loading", "").lower() == "lazy",
        })
    return images


def extract_meta_tags(soup: BeautifulSoup) -> dict:
    meta = {}
    for tag in soup.find_all("meta"):
        name = tag.get("name", "") or tag.get("property", "")
        content = tag.get("content", "")
        if name and content:
            meta[name.lower()] = content
    return meta


def extract_schema_json(soup: BeautifulSoup) -> list[dict]:
    schemas = []
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, list):
                schemas.extend(data)
            else:
                schemas.append(data)
        except (json.JSONDecodeError, TypeError):
            continue
    return schemas
