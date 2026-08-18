from fastapi import APIRouter, Header, HTTPException

from app.bot.dispatcher import create_bot
from app.bot.notify import run_notification_check
from app.config import settings

router = APIRouter(tags=["cron"])


@router.get("/api/cron/notifications")
async def cron_notifications(authorization: str = Header(default="")) -> dict:
    if not settings.cron_secret or authorization != f"Bearer {settings.cron_secret}":
        raise HTTPException(status_code=401, detail="unauthorized")

    bot = create_bot()
    try:
        await run_notification_check(bot)
    finally:
        await bot.session.close()

    return {"ok": True}
