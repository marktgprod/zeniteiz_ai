from datetime import datetime, timezone

from aiogram.exceptions import TelegramAPIError
from aiogram.types import BotCommand
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.bot.dispatcher import create_bot
from app.bot.handlers import BOT_COMMANDS
from app.bot.notify import run_notification_check
from app.config import settings
from app.db import get_db
from app.services.limits import reset_daily_requests, reset_monthly_requests
from app.services.news_fetch import fetch_and_store_news
from app.services.prompt_gen import generate_and_store_prompts

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


@router.get("/api/cron/news")
async def cron_news(authorization: str = Header(default=""), db: AsyncSession = Depends(get_db)) -> dict:
    _check_auth(authorization)
    added = await fetch_and_store_news(db)
    return {"ok": True, "added": added}


@router.get("/api/cron/prompts")
async def cron_prompts(authorization: str = Header(default=""), db: AsyncSession = Depends(get_db)) -> dict:
    _check_auth(authorization)
    added = await generate_and_store_prompts(db)
    return {"ok": True, "added": added}


@router.get("/api/cron/reset-limits")
async def cron_reset_limits(authorization: str = Header(default=""), db: AsyncSession = Depends(get_db)) -> dict:
    _check_auth(authorization)
    daily_reset = await reset_daily_requests(db)

    monthly_reset = 0
    if datetime.now(timezone.utc).day == 1:
        monthly_reset = await reset_monthly_requests(db)

    return {"ok": True, "daily_reset": daily_reset, "monthly_reset": monthly_reset}


@router.get("/api/cron/set-commands")
async def set_commands(authorization: str = Header(default="")) -> dict:
    """(Re-)register the bot's Telegram command menu. Call once after adding/
    changing a command in BOT_COMMANDS — Telegram doesn't pick these up on its
    own from the code, only from an explicit setMyCommands call."""
    _check_auth(authorization)

    bot = create_bot()
    try:
        try:
            await bot.set_my_commands([BotCommand(command=cmd, description=desc) for cmd, desc in BOT_COMMANDS])
        except TelegramAPIError as exc:
            raise HTTPException(status_code=502, detail=f"Telegram API unavailable: {exc}") from exc
        return {"ok": True, "commands": [cmd for cmd, _ in BOT_COMMANDS]}
    finally:
        await bot.session.close()


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
