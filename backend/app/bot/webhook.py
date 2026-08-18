from fastapi import APIRouter, Header, HTTPException, Request

from app.config import settings

router = APIRouter(tags=["telegram-webhook"])


@router.post("/telegram/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str = Header(default=""),
) -> dict:
    if settings.telegram_webhook_secret and x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
        raise HTTPException(status_code=401, detail="invalid secret token")

    bot = request.app.state.bot
    dp = request.app.state.dispatcher
    update = await request.json()
    await dp.feed_webhook_update(bot, update)
    return {"ok": True}
