import uuid

from fastapi import Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.telegram_auth import InvalidInitData, verify_init_data


async def get_current_telegram_user(
    x_telegram_init_data: str = Header(default=""),
) -> dict:
    if not x_telegram_init_data:
        raise HTTPException(status_code=401, detail="missing X-Telegram-Init-Data header")
    try:
        return verify_init_data(x_telegram_init_data)
    except InvalidInitData as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


async def get_user_or_404(user_id: uuid.UUID, db: AsyncSession) -> User:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="user not found")
    return user
