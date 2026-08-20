import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class SubscriptionTier(str, enum.Enum):
    FREE = "FREE"
    STARTER = "STARTER"
    PRO = "PRO"
    VIP = "VIP"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    telegram_user_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String, nullable=True)
    first_name: Mapped[str | None] = mapped_column(String, nullable=True)

    subscription_tier: Mapped[SubscriptionTier] = mapped_column(
        Enum(SubscriptionTier), default=SubscriptionTier.FREE
    )
    subscription_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    requests_today: Mapped[int] = mapped_column(Integer, default=0)
    requests_month: Mapped[int] = mapped_column(Integer, default=0)

    last_expiry_reminder_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_limit_reminder_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Loyalty program: loyalty_level is the last level index the user has been
    # credited for (so a level-up reward fires exactly once). reward_tier/
    # reward_expires_at grant a temporary tier boost on top of subscription_tier;
    # reward_video_credits is spent separately since video is the one generation
    # type expensive enough that "unlimited during the boost" isn't viable.
    loyalty_level: Mapped[int] = mapped_column(Integer, default=0)
    reward_tier: Mapped[SubscriptionTier | None] = mapped_column(Enum(SubscriptionTier), nullable=True)
    reward_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reward_video_credits: Mapped[int] = mapped_column(Integer, default=0)

    # Referral program: referred_by_id is set once at signup from the /start
    # deep-link payload. referral_qualified_at marks the moment *this* user's
    # first real Tribute payment landed — only then does the referrer get
    # credit, so a gift always costs less than the revenue that unlocked it.
    # referral_gift_level is the referrer's last rewarded milestone (idempotent,
    # same pattern as loyalty_level).
    referred_by_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)
    referral_qualified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    referral_gift_level: Mapped[int] = mapped_column(Integer, default=0)

    # "ru" or "en" — drives both the mini app UI (fetched on login) and bot
    # message language (looked up per-send, since messages are often sent
    # proactively from cron/webhooks, not in response to a live request).
    language: Mapped[str] = mapped_column(String, default="ru")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
