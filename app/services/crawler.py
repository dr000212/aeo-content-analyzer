import time
from dataclasses import dataclass

import httpx

from app.config import settings


@dataclass
class CrawlResult:
    html: str
    status_code: int
    final_url: str
    load_time_ms: int
    headers: dict


class CrawlError(Exception):
    pass


async def crawl(url: str) -> CrawlResult:
    start = time.monotonic()
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(settings.crawler_timeout),
            follow_redirects=True,
            max_redirects=5,
            headers={"User-Agent": settings.crawler_user_agent},
        ) as client:
            response = await client.get(url)
    except httpx.TimeoutException:
        raise CrawlError(f"Timeout after {settings.crawler_timeout}s fetching {url}")
    except httpx.ConnectError:
        raise CrawlError(f"DNS or connection failure for {url}")
    except httpx.HTTPError as e:
        raise CrawlError(f"HTTP error fetching {url}: {e}")

    load_time_ms = int((time.monotonic() - start) * 1000)

    content_type = response.headers.get("content-type", "")
    if "text/html" not in content_type and "application/xhtml" not in content_type:
        raise CrawlError(f"Non-HTML content type: {content_type}")

    content_length = len(response.content)
    if content_length > settings.crawler_max_content_length:
        raise CrawlError(f"Content too large: {content_length} bytes (max {settings.crawler_max_content_length})")

    return CrawlResult(
        html=response.text,
        status_code=response.status_code,
        final_url=str(response.url),
        load_time_ms=load_time_ms,
        headers=dict(response.headers),
    )
