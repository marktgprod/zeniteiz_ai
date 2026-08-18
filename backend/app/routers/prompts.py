import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.prompt import Prompt, UserFavorite
from app.schemas.prompt import PromptOut

router = APIRouter(tags=["prompts"])


@router.get("/api/prompts", response_model=list[PromptOut])
async def list_prompts(db: AsyncSession = Depends(get_db)) -> list[Prompt]:
    result = await db.execute(select(Prompt).order_by(Prompt.rating.desc()))
    return list(result.scalars().all())


@router.get("/api/prompts/category/{category}", response_model=list[PromptOut])
async def list_prompts_by_category(category: str, db: AsyncSession = Depends(get_db)) -> list[Prompt]:
    result = await db.execute(select(Prompt).where(Prompt.category == category))
    return list(result.scalars().all())


@router.get("/api/prompts/{prompt_id}", response_model=PromptOut)
async def get_prompt(prompt_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> Prompt:
    prompt = await db.get(Prompt, prompt_id)
    if prompt is None:
        raise HTTPException(status_code=404, detail="prompt not found")
    return prompt


@router.post("/api/user/{user_id}/favorites", status_code=201)
async def add_favorite(user_id: uuid.UUID, prompt_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> dict:
    favorite = UserFavorite(user_id=user_id, prompt_id=prompt_id)
    db.add(favorite)
    await db.commit()
    return {"id": str(favorite.id)}


@router.get("/api/user/{user_id}/favorites", response_model=list[PromptOut])
async def list_favorites(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[Prompt]:
    result = await db.execute(
        select(Prompt).join(UserFavorite, UserFavorite.prompt_id == Prompt.id).where(UserFavorite.user_id == user_id)
    )
    return list(result.scalars().all())
