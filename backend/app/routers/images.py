import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.api_request import RequestType
from app.schemas.generation import ImageGenerateRequest
from app.services.history import get_request_history

router = APIRouter(tags=["images"])


@router.post("/api/image/flux")
async def generate_flux(payload: ImageGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="Together AI integration pending (see week 3)")


@router.post("/api/image/dalle3")
async def generate_dalle3(payload: ImageGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="OpenAI integration pending (see week 3)")


@router.post("/api/image/generate-prompt")
async def generate_prompt(payload: ImageGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="Prompt generator pending (see week 3)")


@router.get("/api/user/{user_id}/image-history")
async def image_history(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list:
    return await get_request_history(db, user_id, RequestType.IMAGE)
