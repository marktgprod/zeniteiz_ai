import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.analytics_event import AnalyticsEvent
from app.models.api_request import ApiRequest, RequestStatus
from app.schemas.event import EventIn, EventSummaryOut, RequestStatsOut

router = APIRouter(tags=["events"])

REQUEST_TYPE_LABELS = {"text": "Текст", "image": "Изображения", "video": "Видео"}


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
    """Breakdown of actual successful generations by type (text/image/video) —
    deliberately excludes clicks, page views, and every other platform action."""
    result = await db.execute(
        select(
            ApiRequest.request_type,
            func.count().label("count"),
            func.count(func.distinct(ApiRequest.user_id)).label("unique_users"),
        )
        .where(ApiRequest.status == RequestStatus.SUCCESS)
        .group_by(ApiRequest.request_type)
        .order_by(func.count().desc())
    )
    return [
        EventSummaryOut(
            event_name=REQUEST_TYPE_LABELS.get(row.request_type.value, row.request_type.value),
            count=row.count,
            unique_users=row.unique_users,
        )
        for row in result
    ]


@router.get("/api/events/request-stats", response_model=RequestStatsOut)
async def request_stats(db: AsyncSession = Depends(get_db)) -> RequestStatsOut:
    """Actual successful generations (text/image/video), today vs all-time."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)

    total_result = await db.execute(select(func.count()).where(ApiRequest.status == RequestStatus.SUCCESS))
    today_result = await db.execute(
        select(func.count()).where(ApiRequest.status == RequestStatus.SUCCESS, ApiRequest.created_at >= today_start)
    )
    return RequestStatsOut(today=today_result.scalar_one(), total=total_result.scalar_one())
