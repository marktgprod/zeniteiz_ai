from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    telegram_bot_token: str = ""
    telegram_admin_chat_id: int | None = None
    mini_app_url: str = "https://example.com/app"

    # When set, the FastAPI app itself registers a Telegram webhook and handles
    # bot updates in-process instead of a separate polling process (bot/main.py).
    # Needed for hosts that sleep/scale-to-zero, where a long-lived polling loop
    # can't run reliably. Leave empty for local dev — keep using `python -m app.bot.main`.
    webhook_base_url: str = ""
    telegram_webhook_secret: str = ""

    # Set automatically by Vercel Cron Jobs; verified against the Authorization
    # header on /api/cron/notifications so it can't be triggered by anyone else.
    cron_secret: str = ""

    database_url: str = "sqlite+aiosqlite:///./dev.db"
    redis_url: str = "redis://localhost:6379/0"

    openrouter_api_key: str = ""
    together_api_key: str = ""
    fal_api_key: str = ""
    openai_api_key: str = ""

    # Tribute signs webhooks with the same key used for API auth — there's no
    # separate webhook-only secret, so this should just be the Tribute API key.
    tribute_webhook_secret: str = ""

    cors_origins: list[str] = ["http://localhost:5173"]

    @field_validator("telegram_admin_chat_id", mode="before")
    @classmethod
    def _empty_str_to_none(cls, value: object) -> object:
        return None if value == "" else value


settings = Settings()
