import logging
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.bot.i18n import t
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
    name: dict[str, str]
    threshold: int
    reward_tier: SubscriptionTier | None
    reward_days: int
    reward_video_credits: int
    reward_text: dict[str, str]


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
    Level(0, {"ru": "Новичок", "en": "Newbie"}, 0, None, 0, 0, {"ru": "", "en": ""}),
    Level(
        1,
        {"ru": "Активный", "en": "Active"},
        50,
        SubscriptionTier.PRO,
        2,
        0,
        {"ru": "2 дня тарифа Pro", "en": "2 days of Pro"},
    ),
    Level(
        2,
        {"ru": "Профи", "en": "Pro"},
        150,
        SubscriptionTier.PRO,
        5,
        0,
        {"ru": "5 дней тарифа Pro", "en": "5 days of Pro"},
    ),
    Level(
        3,
        {"ru": "Мастер", "en": "Master"},
        400,
        SubscriptionTier.VIP,
        7,
        3,
        {"ru": "7 дней тарифа VIP", "en": "7 days of VIP"},
    ),
    Level(
        4,
        {"ru": "Легенда", "en": "Legend"},
        1000,
        SubscriptionTier.VIP,
        14,
        10,
        {"ru": "14 дней тарифа VIP", "en": "14 days of VIP"},
    ),
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

    lang = user.language
    text = (
        f"{t(lang, 'level_up_title', level=level.name[lang])}\n\n"
        f"{t(lang, 'level_up_reward', reward=level.reward_text[lang])}\n\n"
        f"{t(lang, 'open_app_cta')}"
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
