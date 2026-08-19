import logging
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import SubscriptionTier, User
from app.schemas.payment import SubscriptionOut, TributeWebhookPayload
from app.services.tribute import verify_webhook_signature
from app.services.user import get_or_create_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["payments"])

# subscription_name is whatever we typed when creating the product in Tribute's
# dashboard ("Starter"/"Pro"/"VIP") — match case-insensitively since it's free text.
TIER_BY_NAME = {"starter": SubscriptionTier.STARTER, "pro": SubscriptionTier.PRO, "vip": SubscriptionTier.VIP}

# Confirmed via a live test payment: real event names are snake_case
# ("new_subscription"), not the camelCase shown in Tribute's docs.
GRANT_EVENTS = {"new_subscription", "renewed_subscription"}


@router.post("/webhook/tribute", status_code=200)
async def tribute_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    trbt_signature: str = Header(default="", alias="trbt-signature"),
) -> dict:
    raw_body = await request.body()
    if not verify_webhook_signature(raw_body, trbt_signature):
        raise HTTPException(status_code=401, detail="invalid signature")

    try:
        event = TributeWebhookPayload.model_validate_json(raw_body)
    except ValidationError:
        # Tribute's own "send test request" button fires a payload that doesn't
        # match any real event shape, and future event types we don't handle
        # yet would look the same to us — acknowledge rather than 422/retry-loop.
        logger.info("Ignoring Tribute webhook with unrecognized shape: %s", raw_body[:500])
        return {"ok": True}

    if event.name not in GRANT_EVENTS:
        logger.info("Ignoring Tribute event %s", event.name)
        return {"ok": True}

    data = event.payload
    tier = TIER_BY_NAME.get(data.subscription_name.strip().lower())
    if tier is None:
        raise HTTPException(status_code=400, detail=f"unknown subscription_name: {data.subscription_name}")

    result = await db.execute(select(User).where(User.telegram_user_id == data.telegram_user_id))
    user = result.scalar_one_or_none()
    if user is None:
        # Someone could reach a Tribute checkout link without ever having opened
        # our bot first — create the account rather than drop a real payment.
        user, _ = await get_or_create_user(db, data.telegram_user_id, data.telegram_username, None)

    db.add(
        Subscription(
            user_id=user.id,
            tier=tier.value,
            amount=data.amount / 100,
            payment_method="tribute",
            tribute_transaction_id=str(data.period_id),
            status=SubscriptionStatus.ACTIVE,
            expires_at=data.expires_at,
        )
    )

    user.subscription_tier = tier
    user.subscription_expires_at = data.expires_at

    await db.commit()
    return {"ok": True}


@router.get("/api/user/{user_id}/payments", response_model=list[SubscriptionOut])
async def list_payments(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[Subscription]:
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id).order_by(Subscription.started_at.desc())
    )
    return list(result.scalars().all())
