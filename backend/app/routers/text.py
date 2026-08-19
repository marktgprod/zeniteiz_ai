import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.api_request import ApiRequest, RequestStatus, RequestType
from app.models.user import User
from app.schemas.generation import TextGenerateRequest
from app.schemas.api_request import ApiRequestOut
from app.services.history import get_request_history
from app.services.limits import REQUEST_LIMITS
from app.services.openrouter import MODEL_SLUGS, OpenRouterError, chat_completion

router = APIRouter(tags=["text"])


async def _generate(model_key: str, payload: TextGenerateRequest, db: AsyncSession) -> dict:
    user = await db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="user not found")

    limit = REQUEST_LIMITS.get(user.subscription_tier, 0)
    if limit == 0:
        raise HTTPException(status_code=403, detail="Текстовые запросы доступны начиная с тарифа Starter")
    if user.requests_today >= limit:
        raise HTTPException(status_code=429, detail=f"Дневной лимит запросов ({limit}) исчерпан")

    model = MODEL_SLUGS[model_key]

    messages = [{"role": m.role, "content": m.content} for m in payload.history[-20:]]
    messages.append({"role": "user", "content": payload.prompt})

    try:
        data = await chat_completion(model, messages, payload.temperature, payload.max_tokens)
    except OpenRouterError as exc:
        db.add(
            ApiRequest(
                user_id=user.id, model=model, request_type=RequestType.TEXT, status=RequestStatus.FAILED
            )
        )
        await db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    text = data["choices"][0]["message"]["content"]
    usage = data.get("usage") or {}

    user.requests_today += 1
    user.requests_month += 1
    db.add(
        ApiRequest(
            user_id=user.id,
            model=model,
            request_type=RequestType.TEXT,
            input_tokens=usage.get("prompt_tokens", 0),
            output_tokens=usage.get("completion_tokens", 0),
            cost=usage.get("cost", 0),
            status=RequestStatus.SUCCESS,
        )
    )
    await db.commit()

    return {"text": text}


@router.post("/api/text/claude")
async def generate_claude(payload: TextGenerateRequest, db: AsyncSession = Depends(get_db)) -> dict:
    return await _generate("claude", payload, db)


@router.post("/api/text/gpt4o")
async def generate_gpt4o(payload: TextGenerateRequest, db: AsyncSession = Depends(get_db)) -> dict:
    return await _generate("gpt4o", payload, db)


@router.get("/api/user/{user_id}/text-history", response_model=list[ApiRequestOut])
async def text_history(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[ApiRequest]:
    return await get_request_history(db, user_id, RequestType.TEXT)
