import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_telegram_user, get_user_or_404
from app.models.user import User
from app.schemas.loyalty import LevelOut, LoyaltyOut
from app.schemas.user import SubscriptionOut, UserOut
from app.services.loyalty import LEVELS, count_generations, has_active_reward, level_for_count, next_level
from app.services.user import get_or_create_user

router = APIRouter(tags=["auth"])


@router.post("/api/auth/login", response_model=UserOut)
async def login(
    telegram_data: dict = Depends(get_current_telegram_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    tg_user = telegram_data["user"]
    user, _ = await get_or_create_user(db, tg_user["id"], tg_user.get("username"), tg_user.get("first_name"))
    return user


@router.get("/api/auth/user/{user_id}", response_model=UserOut)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> User:
    return await get_user_or_404(user_id, db)


@router.get("/api/user/{user_id}/subscription", response_model=SubscriptionOut)
async def get_subscription(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> User:
    return await get_user_or_404(user_id, db)


@router.get("/api/user/{user_id}/loyalty", response_model=LoyaltyOut)
async def get_loyalty(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> LoyaltyOut:
    user = await get_user_or_404(user_id, db)
    generations = await count_generations(db, user.id)
    level = level_for_count(generations)
    upcoming = next_level(generations)
    active_reward = has_active_reward(user)

    return LoyaltyOut(
        generations=generations,
        level_index=level.index,
        level_name=level.name,
        next_level_name=upcoming.name if upcoming else None,
        next_level_threshold=upcoming.threshold if upcoming else None,
        reward_tier=user.reward_tier if active_reward else None,
        reward_expires_at=user.reward_expires_at if active_reward else None,
        reward_video_credits=user.reward_video_credits,
        levels=[
            LevelOut(
                index=lvl.index,
                name=lvl.name,
                threshold=lvl.threshold,
                reward_text=lvl.reward_text,
                unlocked=generations >= lvl.threshold,
            )
            for lvl in LEVELS
            if lvl.index > 0
        ],
    )
