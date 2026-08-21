import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.bot.dispatcher import create_bot, create_dispatcher
from app.bot.webhook import router as webhook_router
from app.config import settings
from app.db import init_db
from app.routers import auth, cron, download, events, images, news, payments, prompts, text, video

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    if settings.webhook_base_url:
        bot = create_bot()
        dp = create_dispatcher(bot)
        app.state.bot = bot
        app.state.dispatcher = dp

        yield
        await bot.session.close()
    else:
        yield


app = FastAPI(title="Zenit Ai API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(text.router)
app.include_router(images.router)
app.include_router(video.router)
app.include_router(download.router)
app.include_router(prompts.router)
app.include_router(news.router)
app.include_router(payments.router)
app.include_router(events.router)
app.include_router(cron.router)

if settings.webhook_base_url:
    app.include_router(webhook_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
