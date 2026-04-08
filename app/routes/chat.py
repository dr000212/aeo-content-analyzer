"""Chat + report retrieval routes."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.db_models import Analysis, ChatMessage
from app.services.chat_service import generate_chat_response, generate_suggested_questions

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatHistoryItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    analysis_id: str
    message: str
    history: list[ChatHistoryItem] = []


class ChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    suggested_questions: list[str] = []


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, session: AsyncSession = Depends(get_session)):
    # Load the stored analysis
    result = await session.execute(select(Analysis).where(Analysis.id == body.analysis_id))
    analysis: Optional[Analysis] = result.scalar_one_or_none()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    history_dicts = [{"role": h.role, "content": h.content} for h in body.history]

    try:
        reply = await generate_chat_response(
            report=analysis.full_report,
            user_message=body.message,
            history=history_dicts,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Persist both messages
    session.add(ChatMessage(analysis_id=body.analysis_id, role="user", content=body.message))
    session.add(ChatMessage(analysis_id=body.analysis_id, role="assistant", content=reply))
    await session.commit()

    return ChatResponse(
        content=reply,
        suggested_questions=generate_suggested_questions(analysis.full_report),
    )


@router.get("/report/{analysis_id}")
async def get_report(analysis_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis: Optional[Analysis] = result.scalar_one_or_none()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis.full_report
