import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.api_request import RequestType
from app.schemas.generation import VideoGenerateRequest
from app.models.api_request import ApiRequest
from app.schemas.api_request import ApiRequestOut
from app.services.history import get_request_history

router = APIRouter(tags=["video"])


@router.post("/api/video/runway")
async def generate_runway(payload: VideoGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="FAL.AI integration pending (see week 4)")


@router.get("/api/user/{user_id}/video-history", response_model=list[ApiRequestOut])
async def video_history(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[ApiRequest]:
    return await get_request_history(db, user_id, RequestType.VIDEO)
