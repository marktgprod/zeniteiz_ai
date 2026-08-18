import uuid
from datetime import datetime

from pydantic import BaseModel


class TributeWebhookPayload(BaseModel):
    telegram_user_id: int
    tier: str
    amount: float
    tribute_transaction_id: str
    expires_at: datetime


class SubscriptionOut(BaseModel):
    id: uuid.UUID
    tier: str
    amount: float
    payment_method: str
    status: str
    started_at: datetime
    expires_at: datetime | None

    model_config = {"from_attributes": True}
