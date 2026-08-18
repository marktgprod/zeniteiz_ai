import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode
from aiogram.types import ErrorEvent

from app.bot.handlers import router
from app.config import settings

logger = logging.getLogger(__name__)

# A slow/unreachable Telegram API must never hang a request indefinitely — this
# bounds every call made through bots created here (webhook registration,
# reminders, error alerts) to a sane worst case instead of aiohttp's long default.
BOT_REQUEST_TIMEOUT_SECONDS = 15


def create_bot() -> Bot:
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set — add it to backend/.env")
    session = AiohttpSession(timeout=BOT_REQUEST_TIMEOUT_SECONDS)
    return Bot(
        token=settings.telegram_bot_token,
        session=session,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )


def create_dispatcher(bot: Bot) -> Dispatcher:
    dp = Dispatcher()
    dp.include_router(router)

    @dp.errors()
    async def on_error(event: ErrorEvent) -> bool:
        logger.exception("Update handling failed", exc_info=event.exception)
        if settings.telegram_admin_chat_id:
            await bot.send_message(settings.telegram_admin_chat_id, f"🚨 Ошибка бота: {event.exception}")
        return True

    return dp
