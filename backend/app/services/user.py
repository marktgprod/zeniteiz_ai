from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import SubscriptionTier, User

TRIAL_DAYS = 3


async def get_user_by_telegram_id(db: AsyncSession, telegram_user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.telegram_user_id == telegram_user_id))
    return result.scalar_one_or_none()


async def get_or_create_user(
    db: AsyncSession,
    telegram_user_id: int,
    username: str | None,
    first_name: str | None,
    referrer_telegram_id: int | None = None,
) -> tuple[User, bool]:
    result = await db.execute(select(User).where(User.telegram_user_id == telegram_user_id))
    user = result.scalar_one_or_none()
    is_new = user is None

    if user is None:
        referred_by_id = None
        if referrer_telegram_id and referrer_telegram_id != telegram_user_id:
            ref_result = await db.execute(select(User).where(User.telegram_user_id == referrer_telegram_id))
            referrer = ref_result.scalar_one_or_none()
            if referrer is not None:
                referred_by_id = referrer.id

        user = User(
            telegram_user_id=telegram_user_id,
            username=username,
            first_name=first_name,
            subscription_tier=SubscriptionTier.STARTER,
            subscription_expires_at=datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS),
            referred_by_id=referred_by_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user, is_new
