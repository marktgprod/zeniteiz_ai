import asyncio
import logging
from datetime import datetime, timedelta, timezone

from aiogram import Bot
from sqlalchemy import select

from app.db import async_session
from app.models.user import User
from app.services.limits import REQUEST_LIMITS

logger = logging.getLogger(__name__)

CHECK_INTERVAL_SECONDS = 24 * 60 * 60


async def _notify_expiring_subscriptions(bot: Bot) -> None:
    soon = datetime.now(timezone.utc) + timedelta(days=3)
    async with async_session() as db:
        result = await db.execute(
            select(User).where(User.subscription_expires_at.is_not(None), User.subscription_expires_at <= soon)
        )
        for user in result.scalars().all():
            try:
                await bot.send_message(
                    user.telegram_user_id,
                    f"⏳ Ваша подписка {user.subscription_tier.value} истекает "
                    f"{user.subscription_expires_at.strftime('%d.%m.%Y')}. Откройте /app, чтобы продлить.",
                )
            except Exception:
                logger.exception("Failed to notify user %s about expiring subscription", user.telegram_user_id)


async def _notify_near_limit(bot: Bot) -> None:
    async with async_session() as db:
        result = await db.execute(select(User))
        for user in result.scalars().all():
            limit = REQUEST_LIMITS.get(user.subscription_tier, 0)
            if limit and user.requests_today >= 0.8 * limit:
                try:
                    await bot.send_message(
                        user.telegram_user_id,
                        f"⚡️ Вы использовали {user.requests_today}/{limit} запросов на сегодня. "
                        "Апгрейдните тариф в /app, чтобы снять ограничение.",
                    )
                except Exception:
                    logger.exception("Failed to notify user %s about request limit", user.telegram_user_id)


async def run_daily_notifications(bot: Bot) -> None:
    while True:
        await _notify_expiring_subscriptions(bot)
        await _notify_near_limit(bot)
        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
