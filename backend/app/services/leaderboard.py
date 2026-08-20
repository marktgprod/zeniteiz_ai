import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_request import ApiRequest, RequestStatus
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardOut

TOP_N = 10


def _display_name(user: User) -> str | None:
    if user.first_name:
        return user.first_name
    if user.username:
        return f"@{user.username}"
    return None


async def _referral_counts(db: AsyncSession) -> list[tuple[uuid.UUID, int]]:
    result = await db.execute(
        select(User.referred_by_id, func.count())
        .where(User.referred_by_id.is_not(None), User.referral_qualified_at.is_not(None))
        .group_by(User.referred_by_id)
    )
    return list(result.all())


async def _activity_counts(db: AsyncSession) -> list[tuple[uuid.UUID, int]]:
    result = await db.execute(
        select(ApiRequest.user_id, func.count())
        .where(ApiRequest.status == RequestStatus.SUCCESS)
        .group_by(ApiRequest.user_id)
    )
    return list(result.all())


async def build_leaderboard(db: AsyncSession, kind: str, viewer_id: uuid.UUID | None) -> LeaderboardOut:
    rows = await (_referral_counts(db) if kind == "referrals" else _activity_counts(db))
    ranked = sorted(rows, key=lambda r: r[1], reverse=True)

    top_ids = [uid for uid, _ in ranked[:TOP_N]]
    users_by_id: dict[uuid.UUID, User] = {}
    if top_ids:
        result = await db.execute(select(User).where(User.id.in_(top_ids)))
        users_by_id = {u.id: u for u in result.scalars().all()}

    entries = [
        LeaderboardEntry(
            rank=i + 1,
            name=_display_name(users_by_id[uid]) if uid in users_by_id else None,
            value=value,
            is_you=viewer_id is not None and uid == viewer_id,
        )
        for i, (uid, value) in enumerate(ranked[:TOP_N])
    ]

    my_rank = None
    my_value = 0
    if viewer_id is not None:
        for i, (uid, value) in enumerate(ranked):
            if uid == viewer_id:
                my_rank = i + 1
                my_value = value
                break

    return LeaderboardOut(entries=entries, my_rank=my_rank, my_value=my_value)
