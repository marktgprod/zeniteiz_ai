import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.leaderboard import LeaderboardOut
from app.services.leaderboard import build_leaderboard

router = APIRouter(tags=["leaderboard"])

_KINDS = ("referrals", "activity")


@router.get("/api/leaderboard/{kind}", response_model=LeaderboardOut)
async def get_leaderboard(
    kind: str,
    user_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
) -> LeaderboardOut:
    if kind not in _KINDS:
        raise HTTPException(status_code=404, detail="unknown leaderboard kind")
    return await build_leaderboard(db, kind, user_id)
