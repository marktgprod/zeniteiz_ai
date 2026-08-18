import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.news import NewsItem
from app.schemas.news import NewsItemOut

router = APIRouter(tags=["news"])


@router.get("/api/news", response_model=list[NewsItemOut])
async def list_news(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[NewsItem]:
    result = await db.execute(
        select(NewsItem)
        .order_by(NewsItem.published_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(result.scalars().all())


@router.get("/api/news/{news_id}", response_model=NewsItemOut)
async def get_news_item(news_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> NewsItem:
    item = await db.get(NewsItem, news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="news item not found")
    return item
