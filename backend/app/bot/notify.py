import logging
from datetime import datetime, timedelta, timezone

from aiogram import Bot
from sqlalchemy import select

from app.db import async_session
from app.models.user import User
from app.services.limits import REQUEST_LIMITS

logger = logging.getLogger(__name__)

# Don't re-send the same reminder to a user more than once within this window,
# even if the check runs more than once a day (cron delivery isn't exactly-once).
REMINDER_COOLDOWN = timedelta(hours=20)


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
                    f"⏳ Ваша подписка {user.subscription_tier.value} истекает "
                    f"{user.subscription_expires_at.strftime('%d.%m.%Y')}. Откройте /app, чтобы продлить.",
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
                    f"⚡️ Вы использовали {user.requests_today}/{limit} запросов на сегодня. "
                    "Апгрейдните тариф в /app, чтобы снять ограничение.",
                )
                user.last_limit_reminder_at = now
                await db.commit()
            except Exception:
                logger.exception("Failed to notify user %s about request limit", user.telegram_user_id)


async def run_notification_check(bot: Bot) -> None:
    """Run all reminder checks once. Call this from a scheduler (Vercel Cron), not a loop —
    the backend runs as a serverless function and has no long-lived process to loop in."""
    await _notify_expiring_subscriptions(bot)
    await _notify_near_limit(bot)
