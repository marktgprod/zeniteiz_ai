import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_telegram_user, get_user_or_404
from app.models.user import User
from app.schemas.user import SubscriptionOut, UserOut

router = APIRouter(tags=["auth"])


@router.post("/api/auth/login", response_model=UserOut)
async def login(
    telegram_data: dict = Depends(get_current_telegram_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    tg_user = telegram_data["user"]
    result = await db.execute(select(User).where(User.telegram_user_id == tg_user["id"]))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            telegram_user_id=tg_user["id"],
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user


@router.get("/api/auth/user/{user_id}", response_model=UserOut)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> User:
    return await get_user_or_404(user_id, db)


@router.get("/api/user/{user_id}/subscription", response_model=SubscriptionOut)
async def get_subscription(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> User:
    return await get_user_or_404(user_id, db)
