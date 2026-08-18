import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, Integer, String, Uuid, func
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

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
