import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class RequestType(str, enum.Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"


class RequestStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"


class ApiRequest(Base):
    __tablename__ = "api_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    model: Mapped[str] = mapped_column(String)
    request_type: Mapped[RequestType] = mapped_column(Enum(RequestType))

    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost: Mapped[float] = mapped_column(Numeric(10, 4), default=0)
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.SUCCESS)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
