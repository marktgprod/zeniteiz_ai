import uuid
from datetime import datetime

from pydantic import BaseModel


class TributeSubscriptionData(BaseModel):
    subscription_name: str
    subscription_id: int
    period_id: int
    period: str
    price: int
    amount: int
    currency: str
    telegram_user_id: int
    telegram_username: str | None = None
    expires_at: datetime
    type: str


class TributeWebhookPayload(BaseModel):
    """Real shape confirmed against a live test payment — Tribute's own OpenAPI
    docs describe a different (shop-order) schema that doesn't match what's
    actually delivered for subscription events."""

    name: str
    payload: TributeSubscriptionData


class SubscriptionOut(BaseModel):
    id: uuid.UUID
    tier: str
    amount: float
    payment_method: str
    status: str
    started_at: datetime
    expires_at: datetime | None

    model_config = {"from_attributes": True}
