import logging
from datetime import datetime, timedelta, timezone

from aiogram import Bot
from sqlalchemy import select

from app.bot.i18n import t
from app.db import async_session
from app.models.user import SubscriptionTier, User
from app.services.limits import REQUEST_LIMITS

logger = logging.getLogger(__name__)

# Don't re-send the same reminder to a user more than once within this window,
# even if the check runs more than once a day (cron delivery isn't exactly-once).
REMINDER_COOLDOWN = timedelta(hours=20)


async def _downgrade_expired_and_upsell(bot: Bot) -> None:
    """Nothing else in the app ever clears an expired subscription_expires_at,
    so without this a trial (or, once Tribute is live, a lapsed paid plan)
    never actually ends — the user keeps paid-tier access forever. Downgrading
    to FREE and clearing expires_at also stops _notify_expiring_subscriptions
    from re-sending the same "expires soon" reminder indefinitely."""
    now = datetime.now(timezone.utc)
    async with async_session() as db:
        result = await db.execute(
            select(User).where(
                User.subscription_expires_at.is_not(None),
                User.subscription_expires_at <= now,
                User.subscription_tier != SubscriptionTier.FREE,
            )
        )
        for user in result.scalars().all():
            old_tier = user.subscription_tier.value
            user.subscription_tier = SubscriptionTier.FREE
            user.subscription_expires_at = None
            await db.commit()

            try:
                await bot.send_message(user.telegram_user_id, t(user.language, "subscription_ended", tier=old_tier))
            except Exception:
                logger.exception("Failed to notify user %s about subscription downgrade", user.telegram_user_id)


async def _notify_reward_expired(bot: Bot) -> None:
    """Loyalty-level rewards grant a temporary tier boost (reward_tier/
    reward_expires_at) separate from the user's real subscription. Nothing
    else clears these once they lapse, and — unlike the real-subscription
    downgrade — nothing tells the user their bonus access just ended."""
    now = datetime.now(timezone.utc)
    async with async_session() as db:
        result = await db.execute(
            select(User).where(User.reward_tier.is_not(None), User.reward_expires_at.is_not(None), User.reward_expires_at <= now)
        )
        for user in result.scalars().all():
            old_reward_tier = user.reward_tier.value
            user.reward_tier = None
            user.reward_expires_at = None
            await db.commit()

            try:
                await bot.send_message(
                    user.telegram_user_id,
                    t(user.language, "reward_expired", tier=old_reward_tier, real_tier=user.subscription_tier.value),
                )
            except Exception:
                logger.exception("Failed to notify user %s about reward expiry", user.telegram_user_id)


async def _notify_expiring_subscriptions(bot: Bot) -> None:
    now = datetime.now(timezone.utc)
    soon = now + timedelta(days=3)
    async with async_session() as db:
        result = await db.execute(
            select(User).where(User.subscription_expires_at.is_not(None), User.subscription_expires_at <= soon)
        )
        for user in result.scalars().all():
            if user.last_expiry_reminder_at and now - user.last_expiry_reminder_at < REMINDER_COOLDOWN:
                continue
            try:
                await bot.send_message(
                    user.telegram_user_id,
                    t(
                        user.language,
                        "subscription_expiring",
                        tier=user.subscription_tier.value,
                        date=user.subscription_expires_at.strftime("%d.%m.%Y"),
                    ),
                )
                user.last_expiry_reminder_at = now
                await db.commit()
            except Exception:
                logger.exception("Failed to notify user %s about expiring subscription", user.telegram_user_id)


async def _notify_near_limit(bot: Bot) -> None:
    now = datetime.now(timezone.utc)
    async with async_session() as db:
        result = await db.execute(select(User))
        for user in result.scalars().all():
            limit = REQUEST_LIMITS.get(user.subscription_tier, 0)
            if not limit or user.requests_today < 0.8 * limit:
                continue
            if user.last_limit_reminder_at and now - user.last_limit_reminder_at < REMINDER_COOLDOWN:
                continue
            try:
                await bot.send_message(
                    user.telegram_user_id,
                    t(user.language, "near_limit", today=user.requests_today, limit=limit),
                )
                user.last_limit_reminder_at = now
                await db.commit()
            except Exception:
                logger.exception("Failed to notify user %s about request limit", user.telegram_user_id)


async def run_notification_check(bot: Bot) -> None:
    """Run all reminder checks once. Call this from a scheduler (Vercel Cron), not a loop —
    the backend runs as a serverless function and has no long-lived process to loop in."""
    await _downgrade_expired_and_upsell(bot)
    await _notify_reward_expired(bot)
    await _notify_expiring_subscriptions(bot)
    await _notify_near_limit(bot)
