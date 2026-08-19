from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import SubscriptionTier, User

REQUEST_LIMITS: dict[SubscriptionTier, int] = {
    SubscriptionTier.FREE: 0,
    SubscriptionTier.STARTER: 50,
    SubscriptionTier.PRO: 100,
    SubscriptionTier.VIP: 5000,
}


async def reset_daily_requests(db: AsyncSession) -> int:
    """requests_today is only ever incremented on generation — without this,
    a user who hits their daily limit once stays locked out forever, not
    just until the next day as promised in the app's own FAQ."""
    result = await db.execute(update(User).values(requests_today=0).where(User.requests_today > 0))
    await db.commit()
    return result.rowcount


async def reset_monthly_requests(db: AsyncSession) -> int:
    """requests_month is display-only (shown in /stats, not used for gating),
    but never resetting it means the "this month" label is really "all time"."""
    result = await db.execute(update(User).values(requests_month=0).where(User.requests_month > 0))
    await db.commit()
    return result.rowcount
