from datetime import datetime

from pydantic import BaseModel


class MarathonOut(BaseModel):
    started: bool
    started_at: datetime | None
    current_day: int
