import logging
from datetime import datetime, timezone

from aiogram import Bot
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.bot.i18n import t
from app.db import async_session
from app.models.user import User

logger = logging.getLogger(__name__)

MARATHON_LENGTH = 7

# Short day titles for the bot's daily unlock notification. Full task/prompt
# copy lives in the frontend (frontend/src/lib/earnContent.ts) since only the
# mini app renders the actual lesson content — the bot just pings and links back.
DAY_TITLES: dict[int, dict[str, str]] = {
    1: {"ru": "Первый текст", "en": "First AI text"},
    2: {"ru": "Первое лого", "en": "First logo"},
    3: {"ru": "Коммерческое предложение", "en": "Business proposal"},
    4: {"ru": "Портфолио", "en": "Portfolio"},
    5: {"ru": "Видео-визитка", "en": "Video showcase"},
    6: {"ru": "Первое объявление", "en": "First listing"},
    7: {"ru": "Итоги недели", "en": "Weekly wrap-up"},
}


def compute_current_day(started_at: datetime | None) -> int:
    if started_at is None:
        return 0
    now = datetime.now(timezone.utc)
    elapsed_days = (now - started_at).total_seconds() // 86400
    return min(MARATHON_LENGTH, int(elapsed_days) + 1)


async def start_marathon(db: AsyncSession, user: User) -> None:
    if user.marathon_started_at is not None:
        return
    user.marathon_started_at = datetime.now(timezone.utc)
    await db.commit()


async def notify_marathon_progress(bot: Bot) -> None:
    """Daily cron: DM users an unlock message the first time we see their
    current_day advance past what they were last notified for."""
    async with async_session() as db:
        result = await db.execute(select(User).where(User.marathon_started_at.is_not(None)))
        for user in result.scalars().all():
            day = compute_current_day(user.marathon_started_at)
            if day <= user.marathon_last_notified_day or day > MARATHON_LENGTH:
                continue
            try:
                await bot.send_message(
                    user.telegram_user_id,
                    t(user.language, "marathon_day_unlocked", day=day, title=DAY_TITLES[day][user.language if user.language in ("ru", "en") else "ru"]),
                )
                user.marathon_last_notified_day = day
                await db.commit()
            except Exception:
                logger.exception("Failed to notify user %s about marathon day %s", user.telegram_user_id, day)
