import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

logger = logging.getLogger(__name__)

BOT_USERNAME = "zeniteizai_bot"


@dataclass(frozen=True)
class ReferralMilestone:
    index: int
    referrals_required: int
    gift_id: str
    gift_label: str


# The gift only fires once a referred friend actually pays for a subscription
# via Tribute — never on signup or free-trial usage — so the ~$0.30-$2 cost is
# always covered by real revenue we just received, and there's no way to farm
# it with throwaway accounts (a fake account still has to pay real money).
MILESTONES: list[ReferralMilestone] = [
    ReferralMilestone(1, 1, "5170145012310081615", "💝"),
    ReferralMilestone(2, 5, "5168043875654172773", "🏆"),
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
    and sends a Telegram gift if a milestone was just reached."""
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
            sent = await _send_gift(referrer, milestone, count)
            if sent:
                referrer.referral_gift_level = milestone.index
                await db.commit()


async def _send_gift(referrer: User, milestone: ReferralMilestone, count: int) -> bool:
    from app.bot.dispatcher import create_bot

    try:
        bot = create_bot()
    except Exception:
        logger.exception("Failed to create bot to send referral gift to %s", referrer.telegram_user_id)
        return False

    try:
        await bot.send_gift(
            gift_id=milestone.gift_id,
            user_id=referrer.telegram_user_id,
            text=f"🎉 Спасибо, что делитесь Zenit Ai! Уже {count} друзей оформили подписку по вашей ссылке.",
        )
        return True
    except Exception:
        # Left un-marked (referral_gift_level not bumped) so the next qualifying
        # referral retries this milestone — e.g. if the bot's Stars balance ran out.
        logger.exception("Failed to send referral gift to %s", referrer.telegram_user_id)
        return False
    finally:
        await bot.session.close()
