import uuid

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class TextGenerateRequest(BaseModel):
    user_id: uuid.UUID
    prompt: str
    history: list[ChatMessage] = []
    temperature: float = 0.7
    max_tokens: int = 1024


class ImageGenerateRequest(BaseModel):
    user_id: uuid.UUID
    prompt: str
    size: str = "1024x1024"
    count: int = 1


class VideoGenerateRequest(BaseModel):
    user_id: uuid.UUID
    prompt: str
