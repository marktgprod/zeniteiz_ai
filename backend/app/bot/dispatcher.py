import logging
import socket

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


class Ipv4OnlySession(AiohttpSession):
    """Forces IPv4-only DNS resolution/connections.

    api.telegram.org resolves to both A and AAAA records. On networks without
    working IPv6 egress, aiohttp's connector can attempt the IPv6 address first,
    hang until it times out, and only then fall back to IPv4 — turning every
    call into a multi-second (sometimes multi-minute, with retries) delay
    instead of a fast failure or success. Forcing AF_INET skips that entirely.
    """

    def __init__(self, *args: object, **kwargs: object) -> None:
        super().__init__(*args, **kwargs)
        self._connector_init["family"] = socket.AF_INET


def create_bot() -> Bot:
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set — add it to backend/.env")
    session = Ipv4OnlySession(timeout=BOT_REQUEST_TIMEOUT_SECONDS)
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
