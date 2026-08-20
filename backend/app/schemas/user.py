import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.user import SubscriptionTier


class SubscriptionOut(BaseModel):
    subscription_tier: SubscriptionTier
    subscription_expires_at: datetime | None
    requests_today: int
    requests_month: int

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: uuid.UUID
    telegram_user_id: int
    username: str | None
    first_name: str | None
    subscription_tier: SubscriptionTier
    subscription_expires_at: datetime | None
    requests_today: int
    language: str

    model_config = {"from_attributes": True}


class LanguageIn(BaseModel):
    language: str
