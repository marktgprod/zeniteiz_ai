import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_request import ApiRequest, RequestType


async def get_request_history(db: AsyncSession, user_id: uuid.UUID, request_type: RequestType) -> list[ApiRequest]:
    result = await db.execute(
        select(ApiRequest)
        .where(ApiRequest.user_id == user_id, ApiRequest.request_type == request_type)
        .order_by(ApiRequest.created_at.desc())
    )
    return list(result.scalars().all())
