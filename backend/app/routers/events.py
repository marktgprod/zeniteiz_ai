import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.analytics_event import AnalyticsEvent
from app.schemas.event import EventIn, EventSummaryOut, RequestStatsOut

router = APIRouter(tags=["events"])

GENERATION_EVENTS = ["text_generate_click", "image_generate_click", "video_generate_click"]


@router.post("/api/events", status_code=201)
async def track_event(payload: EventIn, db: AsyncSession = Depends(get_db)) -> dict:
    event = AnalyticsEvent(
        user_id=payload.user_id,
        event_name=payload.event_name,
        data=json.dumps(payload.data) if payload.data is not None else None,
    )
    db.add(event)
    await db.commit()
    return {"ok": True}


@router.get("/api/events/summary", response_model=list[EventSummaryOut])
async def events_summary(db: AsyncSession = Depends(get_db)) -> list[EventSummaryOut]:
    result = await db.execute(
        select(
            AnalyticsEvent.event_name,
            func.count().label("count"),
            func.count(func.distinct(AnalyticsEvent.user_id)).label("unique_users"),
        )
        .group_by(AnalyticsEvent.event_name)
        .order_by(func.count().desc())
    )
    return [EventSummaryOut(event_name=row.event_name, count=row.count, unique_users=row.unique_users) for row in result]


@router.get("/api/events/request-stats", response_model=RequestStatsOut)
async def request_stats(db: AsyncSession = Depends(get_db)) -> RequestStatsOut:
    """Demand for AI generation (text/image/video), today vs all-time.

    Counts generate *clicks*, not completed generations — actual model
    calls aren't wired up yet, so this is a demand signal for now.
    """
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)

    total_result = await db.execute(select(func.count()).where(AnalyticsEvent.event_name.in_(GENERATION_EVENTS)))
    today_result = await db.execute(
        select(func.count()).where(
            AnalyticsEvent.event_name.in_(GENERATION_EVENTS), AnalyticsEvent.created_at >= today_start
        )
    )
    return RequestStatsOut(today=today_result.scalar_one(), total=total_result.scalar_one())
