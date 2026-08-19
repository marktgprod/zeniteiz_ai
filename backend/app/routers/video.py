import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.api_request import ApiRequest, RequestStatus, RequestType
from app.models.user import SubscriptionTier, User
from app.schemas.api_request import ApiRequestOut
from app.schemas.generation import VideoGenerateRequest
from app.services.fal import MINIMAX_MODEL, FalError, get_video_result, get_video_status, submit_video
from app.services.history import get_request_history
from app.services.loyalty import check_level_up, get_effective_tier
from app.services.openrouter import translate_to_english

router = APIRouter(tags=["video"])


@router.post("/api/video/runway")
async def generate_video(payload: VideoGenerateRequest, db: AsyncSession = Depends(get_db)) -> dict:
    user = await db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="user not found")

    # Real VIP is unlimited. A loyalty-reward VIP boost only covers text/image —
    # video is expensive enough (~$0.50/generation) that it's metered separately
    # via reward_video_credits even while the boosted tier is active.
    using_reward_credit = False
    if user.subscription_tier != SubscriptionTier.VIP:
        if get_effective_tier(user) != SubscriptionTier.VIP:
            raise HTTPException(status_code=403, detail="Видео доступно только на тарифе VIP")
        if user.reward_video_credits <= 0:
            raise HTTPException(
                status_code=403,
                detail="Бесплатные видео из награды закончились — оформите тариф VIP для безлимита",
            )
        using_reward_credit = True

    prompt = await translate_to_english(payload.prompt)

    try:
        request_id = await submit_video(prompt)
    except FalError as exc:
        db.add(
            ApiRequest(
                user_id=user.id, model=MINIMAX_MODEL, request_type=RequestType.VIDEO, status=RequestStatus.FAILED
            )
        )
        await db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    user.requests_today += 1
    user.requests_month += 1
    if using_reward_credit:
        user.reward_video_credits -= 1
    db.add(
        ApiRequest(
            user_id=user.id,
            model=MINIMAX_MODEL,
            request_type=RequestType.VIDEO,
            status=RequestStatus.SUCCESS,
        )
    )
    await db.commit()
    await check_level_up(db, user)

    return {"request_id": request_id}


@router.get("/api/video/status/{request_id}")
async def video_status(request_id: str) -> dict:
    try:
        status_data = await get_video_status(request_id)
        status = status_data.get("status")

        if status == "COMPLETED":
            video_url = await get_video_result(request_id)
            return {"status": "completed", "video_url": video_url}

        if status in ("IN_QUEUE", "IN_PROGRESS"):
            return {"status": "pending"}

        raise HTTPException(status_code=502, detail=f"Неожиданный статус генерации: {status}")
    except FalError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/api/user/{user_id}/video-history", response_model=list[ApiRequestOut])
async def video_history(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[ApiRequest]:
    return await get_request_history(db, user_id, RequestType.VIDEO)
