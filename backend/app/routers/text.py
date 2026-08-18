import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.api_request import RequestType
from app.schemas.generation import TextGenerateRequest
from app.services.history import get_request_history

router = APIRouter(tags=["text"])


@router.post("/api/text/claude")
async def generate_claude(payload: TextGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="OpenRouter integration pending (see week 2)")


@router.post("/api/text/gpt4o")
async def generate_gpt4o(payload: TextGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="OpenRouter integration pending (see week 2)")


@router.get("/api/user/{user_id}/text-history")
async def text_history(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list:
    return await get_request_history(db, user_id, RequestType.TEXT)
