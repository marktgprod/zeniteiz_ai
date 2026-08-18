import uuid
from datetime import datetime

from pydantic import BaseModel


class NewsItemOut(BaseModel):
    id: uuid.UUID
    title: str
    summary: str
    content: str
    source_url: str | None
    published_at: datetime

    model_config = {"from_attributes": True}
