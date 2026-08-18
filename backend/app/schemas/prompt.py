import uuid

from pydantic import BaseModel


class PromptOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    category: str
    prompt_text: str
    model_type: str
    rating: float

    model_config = {"from_attributes": True}
