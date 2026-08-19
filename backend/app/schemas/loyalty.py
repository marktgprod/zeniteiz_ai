from datetime import datetime

from pydantic import BaseModel

from app.models.user import SubscriptionTier


class LevelOut(BaseModel):
    index: int
    name: str
    threshold: int
    reward_text: str
    unlocked: bool


class LoyaltyOut(BaseModel):
    generations: int
    level_index: int
    level_name: str
    next_level_name: str | None
    next_level_threshold: int | None
    reward_tier: SubscriptionTier | None
    reward_expires_at: datetime | None
    reward_video_credits: int
    levels: list[LevelOut]
