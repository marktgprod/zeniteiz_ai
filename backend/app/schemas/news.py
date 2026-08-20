import uuid
from datetime import datetime

from pydantic import BaseModel


class NewsItemOut(BaseModel):
    id: uuid.UUID
    title: str
    summary: str
    content: str
    title_en: str | None
    summary_en: str | None
    content_en: str | None
    source_url: str | None
    published_at: datetime

    model_config = {"from_attributes": True}
