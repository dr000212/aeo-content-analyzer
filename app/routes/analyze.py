import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models.db_models import Analysis
from app.models.request import AnalyzeRequest
from app.models.response import AnalyzeResponse
from app.services.chat_service import generate_suggested_questions
from app.services.crawler import CrawlError
from app.services.orchestrator import analyze

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def analyze_url(
    request: Request,
    body: AnalyzeRequest,
    session: AsyncSession = Depends(get_session),
):
    url = str(body.url)
    logger.info(f"Analyzing URL: {url}")

    try:
        result: AnalyzeResponse = await analyze(url, body.options)
    except CrawlError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception(f"Analysis failed for {url}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # Store the full report so the chat endpoint can ground GPT responses.
    # If the DB write fails we still return the analysis (chat just won't work).
    try:
        report_dict = result.model_dump(mode="json")
        record = Analysis(
            url=result.url,
            overall_score=result.overall_score,
            grade=result.grade,
            full_report=report_dict,
        )
        session.add(record)
        await session.commit()
        await session.refresh(record)

        result.analysis_id = record.id
        result.suggested_questions = generate_suggested_questions(report_dict)
    except Exception:
        logger.exception("Failed to persist analysis (chat will be disabled for this run)")

    return result
