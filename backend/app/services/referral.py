import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import SubscriptionTier, User
from app.services.rewards import grant_tier_boost

logger = logging.getLogger(__name__)

BOT_USERNAME = "zeniteizai_bot"


@dataclass(frozen=True)
class ReferralMilestone:
    index: int
    referrals_required: int
    tier: SubscriptionTier
    days: int
    video_credits: int
    label: str


# The bonus only fires once a referred friend actually pays for a subscription
# via Tribute — never on signup or free-trial usage — so it's always a
# retention/upsell mechanic funded by revenue we already received, not
# something a throwaway account can farm (a fake account still has to pay
# real money to qualify). Stacks with any active loyalty-level boost via
# grant_tier_boost rather than overwriting it — see app/services/rewards.py.
MILESTONES: list[ReferralMilestone] = [
    ReferralMilestone(1, 1, SubscriptionTier.PRO, 3, 0, "3 дня тарифа Pro"),
    ReferralMilestone(2, 5, SubscriptionTier.VIP, 7, 3, "7 дней тарифа VIP"),
]


def referral_link(telegram_user_id: int) -> str:
    return f"https://t.me/{BOT_USERNAME}?start=ref_{telegram_user_id}"


def parse_referrer_telegram_id(start_payload: str | None) -> int | None:
    if not start_payload or not start_payload.startswith("ref_"):
        return None
    try:
        return int(start_payload.removeprefix("ref_"))
    except ValueError:
        return None


async def count_qualified_referrals(db: AsyncSession, referrer_id: uuid.UUID) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(User.referred_by_id == referrer_id, User.referral_qualified_at.is_not(None))
    )
    return result.scalar_one()


async def process_referral_payment(db: AsyncSession, user: User) -> None:
    """Call after a real Tribute payment is applied to `user`. If they were
    referred and this is their first paid conversion, credits the referrer
    and grants a tier-boost bonus if a milestone was just reached."""
    if not user.referred_by_id or user.referral_qualified_at is not None:
        return

    user.referral_qualified_at = datetime.now(timezone.utc)
    await db.commit()

    referrer = await db.get(User, user.referred_by_id)
    if referrer is None:
        return

    count = await count_qualified_referrals(db, referrer.id)

    for milestone in MILESTONES:
        if count >= milestone.referrals_required and referrer.referral_gift_level < milestone.index:
            referrer.referral_gift_level = milestone.index
            grant_tier_boost(referrer, milestone.tier, milestone.days, milestone.video_credits)
            await db.commit()
            await _notify_referral_bonus(referrer, milestone, count)


async def _notify_referral_bonus(referrer: User, milestone: ReferralMilestone, count: int) -> None:
    from app.bot.dispatcher import create_bot

    text = (
        f"🎉 Спасибо, что делитесь Zenit Ai! Уже {count} друзей оформили подписку по вашей ссылке.\n\n"
        f"Награда: {milestone.label}.\n\n"
        "Откройте /app, чтобы воспользоваться."
    )
    try:
        bot = create_bot()
    except Exception:
        logger.exception("Failed to create bot for referral bonus notification to %s", referrer.telegram_user_id)
        return

    try:
        await bot.send_message(referrer.telegram_user_id, text)
    except Exception:
        logger.exception("Failed to send referral bonus notification to %s", referrer.telegram_user_id)
    finally:
        await bot.session.close()
