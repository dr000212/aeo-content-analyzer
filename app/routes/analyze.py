import logging

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.models.request import AnalyzeRequest
from app.models.response import AnalyzeResponse
from app.services.crawler import CrawlError
from app.services.orchestrator import analyze

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def analyze_url(request: Request, body: AnalyzeRequest):
    url = str(body.url)
    logger.info(f"Analyzing URL: {url}")

    try:
        result = await analyze(url, body.options)
        return result
    except CrawlError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception(f"Analysis failed for {url}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
