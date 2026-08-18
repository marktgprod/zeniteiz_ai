import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_telegram_user, get_user_or_404
from app.models.user import User
from app.schemas.user import SubscriptionOut, UserOut
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
