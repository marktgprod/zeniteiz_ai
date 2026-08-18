import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.api_request import ApiRequest, RequestStatus, RequestType
from app.models.user import User
from app.schemas.api_request import ApiRequestOut
from app.schemas.generation import ImageGenerateRequest
from app.services.history import get_request_history
from app.services.limits import REQUEST_LIMITS
from app.services.together import FLUX_MODEL, TogetherError, estimate_cost, generate_image

router = APIRouter(tags=["images"])


def _parse_size(size: str) -> tuple[int, int]:
    try:
        width_str, height_str = size.lower().split("x")
        return int(width_str), int(height_str)
    except (ValueError, AttributeError) as exc:
        raise HTTPException(status_code=400, detail="size must look like '1024x1024'") from exc


@router.post("/api/image/flux")
async def generate_flux(payload: ImageGenerateRequest, db: AsyncSession = Depends(get_db)) -> dict:
    user = await db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="user not found")

    limit = REQUEST_LIMITS.get(user.subscription_tier, 0)
    if limit == 0:
        raise HTTPException(status_code=403, detail="Изображения доступны начиная с тарифа Pro")
    if user.requests_today >= limit:
        raise HTTPException(status_code=429, detail=f"Дневной лимит запросов ({limit}) исчерпан")

    width, height = _parse_size(payload.size)

    try:
        data = await generate_image(payload.prompt, width, height, payload.count)
    except TogetherError as exc:
        db.add(
            ApiRequest(
                user_id=user.id, model=FLUX_MODEL, request_type=RequestType.IMAGE, status=RequestStatus.FAILED
            )
        )
        await db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    image_urls = [item["url"] for item in data.get("data", [])]

    user.requests_today += 1
    user.requests_month += 1
    db.add(
        ApiRequest(
            user_id=user.id,
            model=FLUX_MODEL,
            request_type=RequestType.IMAGE,
            cost=estimate_cost(width, height, payload.count),
            status=RequestStatus.SUCCESS,
        )
    )
    await db.commit()

    return {"images": image_urls}


@router.post("/api/image/dalle3")
async def generate_dalle3(payload: ImageGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="OpenAI integration pending")


@router.post("/api/image/generate-prompt")
async def generate_prompt(payload: ImageGenerateRequest) -> dict:
    raise HTTPException(status_code=501, detail="Prompt generator pending")


@router.get("/api/user/{user_id}/image-history", response_model=list[ApiRequestOut])
async def image_history(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[ApiRequest]:
    return await get_request_history(db, user_id, RequestType.IMAGE)
