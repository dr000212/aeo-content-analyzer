import hashlib
import json
import logging
from typing import Optional

from app.config import settings
from app.models.response import AnalyzeResponse

logger = logging.getLogger(__name__)

_redis_client = None


async def _get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            import redis.asyncio as aioredis
            _redis_client = aioredis.from_url(
                settings.redis_url,
                decode_responses=True,
            )
            # Test connection
            await _redis_client.ping()
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            _redis_client = None
    return _redis_client


def _cache_key(url: str) -> str:
    url_hash = hashlib.sha256(url.encode()).hexdigest()
    return f"aeo:analysis:{url_hash}"


async def get_cached(url: str) -> Optional[AnalyzeResponse]:
    try:
        client = await _get_redis()
        if client is None:
            return None
        data = await client.get(_cache_key(url))
        if data:
            return AnalyzeResponse.model_validate_json(data)
    except Exception as e:
        logger.warning(f"Cache read failed: {e}")
    return None


async def set_cached(url: str, result: AnalyzeResponse) -> None:
    try:
        client = await _get_redis()
        if client is None:
            return
        await client.set(
            _cache_key(url),
            result.model_dump_json(),
            ex=settings.cache_ttl_seconds,
        )
    except Exception as e:
        logger.warning(f"Cache write failed: {e}")
