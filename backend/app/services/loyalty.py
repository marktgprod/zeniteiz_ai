import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_request import ApiRequest, RequestStatus
from app.models.user import SubscriptionTier, User

logger = logging.getLogger(__name__)

TIER_RANK = {
    SubscriptionTier.FREE: 0,
    SubscriptionTier.STARTER: 1,
    SubscriptionTier.PRO: 2,
    SubscriptionTier.VIP: 3,
}


@dataclass(frozen=True)
class Level:
    index: int
    name: str
    threshold: int
    reward_tier: SubscriptionTier | None
    reward_days: int
    reward_video_credits: int
    reward_text: str


# Thresholds count lifetime *successful* generations (text+image+video combined).
# FREE tier can't generate anything (see REQUEST_LIMITS), so every level is
# already gated behind an active paying subscription — this is a retention/
# upsell mechanic for existing customers, not a way to earn access for free.
# Video is capped separately via reward_video_credits (not blanket-unlocked by
# the tier boost) because at ~$0.50/generation it's the one model expensive
# enough that "unlimited for a week" could lose money on a single heavy user.
# The cap is intentionally left out of reward_text for VIP-boost levels (3-4) —
# stated as "no need to mention it, VIP already implies video access" — but it
# still applies silently under the hood. Pro-boost levels (1-2) never grant
# video credits at all: video requires effective tier == VIP, so a credit
# attached to a Pro reward would just be dead and unusable.
LEVELS: list[Level] = [
    Level(0, "Новичок", 0, None, 0, 0, ""),
    Level(1, "Активный", 50, SubscriptionTier.PRO, 2, 0, "2 дня тарифа Pro"),
    Level(2, "Профи", 150, SubscriptionTier.PRO, 5, 0, "5 дней тарифа Pro"),
    Level(3, "Мастер", 400, SubscriptionTier.VIP, 7, 3, "7 дней тарифа VIP"),
    Level(4, "Легенда", 1000, SubscriptionTier.VIP, 14, 10, "14 дней тарифа VIP"),
]


def level_for_count(count: int) -> Level:
    current = LEVELS[0]
    for level in LEVELS:
        if count >= level.threshold:
            current = level
    return current


def next_level(count: int) -> Level | None:
    for level in LEVELS:
        if count < level.threshold:
            return level
    return None


async def count_generations(db: AsyncSession, user_id) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(ApiRequest)
        .where(ApiRequest.user_id == user_id, ApiRequest.status == RequestStatus.SUCCESS)
    )
    return result.scalar_one()


def has_active_reward(user: User) -> bool:
    if not user.reward_tier or not user.reward_expires_at:
        return False
    expires_at = user.reward_expires_at
    if expires_at.tzinfo is None:
        # SQLite (local dev only — prod Postgres columns are timezone-aware)
        # drops tzinfo on read; the values are always written in UTC.
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def get_effective_tier(user: User) -> SubscriptionTier:
    """The tier to use for request-limit gating: the higher of the user's real
    subscription and an active, unexpired loyalty reward boost."""
    if has_active_reward(user) and TIER_RANK[user.reward_tier] > TIER_RANK[user.subscription_tier]:
        return user.reward_tier
    return user.subscription_tier


async def check_level_up(db: AsyncSession, user: User) -> None:
    count = await count_generations(db, user.id)
    level = level_for_count(count)
    if level.index <= user.loyalty_level:
        return

    user.loyalty_level = level.index
    if level.reward_tier is not None:
        user.reward_tier = level.reward_tier
        user.reward_expires_at = datetime.now(timezone.utc) + timedelta(days=level.reward_days)
        user.reward_video_credits += level.reward_video_credits
    await db.commit()

    await _notify_level_up(user, level)


async def _notify_level_up(user: User, level: Level) -> None:
    from app.bot.dispatcher import create_bot

    text = (
        f"🏆 Новый уровень: <b>{level.name}</b>!\n\n"
        f"Награда: {level.reward_text}\n\n"
        "Откройте /app, чтобы воспользоваться."
    )
    try:
        bot = create_bot()
    except Exception:
        logger.exception("Failed to create bot for level-up notification to user %s", user.telegram_user_id)
        return

    try:
        await bot.send_message(user.telegram_user_id, text)
    except Exception:
        logger.exception("Failed to send level-up notification to user %s", user.telegram_user_id)
    finally:
        await bot.session.close()
