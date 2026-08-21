import json
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt import Prompt
from app.services.openrouter import MODEL_SLUGS, OpenRouterError, chat_completion

logger = logging.getLogger(__name__)

CATEGORIES = [
    "Маркетинг",
    "Код",
    "Копирайтинг",
    "Аналитика",
    "Творчество",
    "Обучение",
    "Бизнес",
    "Продуктивность",
]

PROMPTS_PER_RUN = 8


async def generate_and_store_prompts(db: AsyncSession) -> int:
    # Rotates one category a day so the library grows breadth-first across all
    # categories over ~8 days, instead of piling everything into one bucket.
    day_index = datetime.now(timezone.utc).timetuple().tm_yday
    category = CATEGORIES[day_index % len(CATEGORIES)]

    recent_titles = (
        (
            await db.execute(
                select(Prompt.title).where(Prompt.category == category).order_by(Prompt.created_at.desc()).limit(15)
            )
        )
        .scalars()
        .all()
    )
    avoid = "\n".join(f"- {t}" for t in recent_titles) or "(пока нет)"

    prompt = (
        f"Сгенерируй {PROMPTS_PER_RUN} новых промптов для библиотеки промптов в категории «{category}» "
        "для приложения с доступом к Claude и GPT-4o mini. Не повторяй уже существующие заголовки. "
        'Ответь строго в формате JSON: {"prompts": [{"title": "...", "description": "...", '
        '"prompt_text": "...", "model_type": "claude или gpt4o"}]}. '
        "title — короткий и цепляющий, до 60 символов. description — одно предложение о том, что делает промпт. "
        "prompt_text — готовый промпт на русском, который пользователь скопирует и отправит модели.\n\n"
        f"Уже есть в категории «{category}» (не повторять):\n{avoid}"
    )

    try:
        data = await chat_completion(
            MODEL_SLUGS["gpt4o"],
            [{"role": "user", "content": prompt}],
            temperature=0.9,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        items = json.loads(data["choices"][0]["message"]["content"])["prompts"]
    except (OpenRouterError, KeyError, json.JSONDecodeError, TypeError):
        logger.warning("Failed to generate prompts for category %s", category, exc_info=True)
        return 0

    added = 0
    for item in items:
        if not isinstance(item, dict):
            continue
        title = (item.get("title") or "").strip()
        prompt_text = (item.get("prompt_text") or "").strip()
        if not title or not prompt_text:
            continue

        db.add(
            Prompt(
                title=title,
                description=(item.get("description") or "").strip(),
                category=category,
                prompt_text=prompt_text,
                model_type=(item.get("model_type") or "claude").strip(),
                rating=0,
            )
        )
        added += 1

    if added:
        await db.commit()
    return added
