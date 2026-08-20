import logging
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_request import ApiRequest, RequestStatus
from app.models.user import SubscriptionTier, User
from app.services.rewards import TIER_RANK, get_effective_tier, grant_tier_boost, has_active_reward

logger = logging.getLogger(__name__)

__all__ = [
    "TIER_RANK",
    "get_effective_tier",
    "has_active_reward",
    "LEVELS",
    "Level",
    "level_for_count",
    "next_level",
    "count_generations",
    "check_level_up",
]


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


async def check_level_up(db: AsyncSession, user: User) -> None:
    count = await count_generations(db, user.id)
    level = level_for_count(count)
    if level.index <= user.loyalty_level:
        return

    user.loyalty_level = level.index
    if level.reward_tier is not None:
        grant_tier_boost(user, level.reward_tier, level.reward_days, level.reward_video_credits)
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
