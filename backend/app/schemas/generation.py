from pydantic import BaseModel


class TextGenerateRequest(BaseModel):
    user_id: str
    prompt: str
    temperature: float = 0.7
    max_tokens: int = 1024


class ImageGenerateRequest(BaseModel):
    user_id: str
    prompt: str
    size: str = "1024x1024"
    count: int = 1


class VideoGenerateRequest(BaseModel):
    user_id: str
    prompt: str
    duration_seconds: int = 5
