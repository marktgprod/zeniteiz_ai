from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    name: str | None
    value: int
    is_you: bool


class LeaderboardOut(BaseModel):
    entries: list[LeaderboardEntry]
    my_rank: int | None
    my_value: int
