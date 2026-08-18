import uuid
from typing import Any

from pydantic import BaseModel


class EventIn(BaseModel):
    event_name: str
    user_id: uuid.UUID | None = None
    data: dict[str, Any] | None = None


class EventSummaryOut(BaseModel):
    event_name: str
    count: int
    unique_users: int


class RequestStatsOut(BaseModel):
    today: int
    total: int
