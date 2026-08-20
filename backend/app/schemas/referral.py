from pydantic import BaseModel


class ReferralOut(BaseModel):
    link: str
    qualified_count: int
    gift_level: int
    next_milestone_count: int | None
    next_milestone_label: str | None
