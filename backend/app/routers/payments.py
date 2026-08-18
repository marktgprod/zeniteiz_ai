import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_user_or_404
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import SubscriptionTier, User
from app.schemas.payment import SubscriptionOut, TributeWebhookPayload
from app.services.tribute import verify_webhook_signature

router = APIRouter(tags=["payments"])


@router.post("/webhook/tribute", status_code=200)
async def tribute_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_tribute_signature: str = Header(default=""),
) -> dict:
    raw_body = await request.body()
    if not verify_webhook_signature(raw_body, x_tribute_signature):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = TributeWebhookPayload.model_validate_json(raw_body)

    result = await db.execute(select(User).where(User.telegram_user_id == payload.telegram_user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="user not found")

    subscription = Subscription(
        user_id=user.id,
        tier=payload.tier,
        amount=payload.amount,
        tribute_transaction_id=payload.tribute_transaction_id,
        status=SubscriptionStatus.ACTIVE,
        expires_at=payload.expires_at,
    )
    db.add(subscription)

    user.subscription_tier = SubscriptionTier(payload.tier)
    user.subscription_expires_at = payload.expires_at

    await db.commit()
    return {"ok": True}


@router.get("/api/user/{user_id}/payments", response_model=list[SubscriptionOut])
async def list_payments(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[Subscription]:
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id).order_by(Subscription.started_at.desc())
    )
    return list(result.scalars().all())


@router.post("/api/user/{user_id}/upgrade")
async def upgrade(user_id: uuid.UUID, tier: str, db: AsyncSession = Depends(get_db)) -> dict:
    await get_user_or_404(user_id, db)
    raise HTTPException(status_code=501, detail="Tribute checkout link generation pending")
