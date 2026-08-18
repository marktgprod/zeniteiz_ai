import json

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.analytics_event import AnalyticsEvent
from app.schemas.event import EventIn, EventSummaryOut

router = APIRouter(tags=["events"])


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
