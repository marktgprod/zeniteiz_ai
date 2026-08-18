import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.api_request import RequestStatus, RequestType


class ApiRequestOut(BaseModel):
    id: uuid.UUID
    model: str
    request_type: RequestType
    input_tokens: int
    output_tokens: int
    cost: float
    status: RequestStatus
    created_at: datetime

    model_config = {"from_attributes": True}
