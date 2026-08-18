from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    telegram_bot_token: str = ""
    telegram_admin_chat_id: int = 0
    mini_app_url: str = "https://example.com/app"

    database_url: str = "sqlite+aiosqlite:///./dev.db"
    redis_url: str = "redis://localhost:6379/0"

    openrouter_api_key: str = ""
    together_api_key: str = ""
    fal_api_key: str = ""
    openai_api_key: str = ""

    tribute_webhook_secret: str = ""

    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
