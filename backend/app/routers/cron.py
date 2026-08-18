from aiogram.exceptions import TelegramAPIError
from fastapi import APIRouter, Header, HTTPException

from app.bot.dispatcher import create_bot
from app.bot.notify import run_notification_check
from app.config import settings

router = APIRouter(tags=["cron"])


def _check_auth(authorization: str) -> None:
    if not settings.cron_secret or authorization != f"Bearer {settings.cron_secret}":
        raise HTTPException(status_code=401, detail="unauthorized")


@router.get("/api/cron/notifications")
async def cron_notifications(authorization: str = Header(default="")) -> dict:
    _check_auth(authorization)

    bot = create_bot()
    try:
        await run_notification_check(bot)
    finally:
        await bot.session.close()

    return {"ok": True}


@router.get("/api/cron/set-webhook")
async def set_webhook(authorization: str = Header(default="")) -> dict:
    """Manually (re-)register the Telegram webhook. Not called on every cold start
    (a slow/unreachable Telegram API must never block ordinary requests) — call this
    once after deploying with a new WEBHOOK_BASE_URL, or let the daily cron self-heal."""
    _check_auth(authorization)

    if not settings.webhook_base_url:
        raise HTTPException(status_code=400, detail="WEBHOOK_BASE_URL is not configured")

    bot = create_bot()
    try:
        webhook_url = f"{settings.webhook_base_url.rstrip('/')}/telegram/webhook"
        try:
            await bot.set_webhook(
                url=webhook_url,
                secret_token=settings.telegram_webhook_secret or None,
                request_timeout=10,
            )
        except TelegramAPIError as exc:
            raise HTTPException(status_code=502, detail=f"Telegram API unavailable: {exc}") from exc
        return {"ok": True, "webhook_url": webhook_url}
    finally:
        await bot.session.close()
