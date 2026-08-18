import asyncio

from sqlalchemy import select

from app.db import async_session, init_db
from app.models.news import NewsItem
from app.models.prompt import Prompt

PROMPTS = [
    {
        "title": "Идеальное резюме под вакансию",
        "description": "Адаптирует резюме под конкретное описание вакансии, выделяя релевантный опыт",
        "category": "business",
        "model_type": "text",
        "prompt_text": (
            "Ты — карьерный консультант. Вот моё резюме: [вставь резюме]. "
            "Вот описание вакансии: [вставь вакансию]. Перепиши резюме так, чтобы "
            "оно максимально соответствовало требованиям вакансии, выделив релевантный опыт "
            "и используя ключевые слова из описания."
        ),
        "rating": 4.8,
    },
    {
        "title": "Ревью кода на уязвимости",
        "description": "Находит потенциальные баги, уязвимости и code smells в фрагменте кода",
        "category": "code",
        "model_type": "text",
        "prompt_text": (
            "Проведи code review следующего фрагмента кода. Укажи: 1) потенциальные баги, "
            "2) проблемы безопасности, 3) нарушения best practices, 4) как улучшить читаемость. "
            "Код: [вставь код]"
        ),
        "rating": 4.9,
    },
    {
        "title": "План контента на месяц",
        "description": "Генерирует контент-план для Telegram-канала на 30 дней",
        "category": "marketing",
        "model_type": "text",
        "prompt_text": (
            "Составь контент-план на 30 дней для Telegram-канала на тему [тема]. "
            "Для каждого дня укажи: формат поста (текст/опрос/видео), заголовок, "
            "краткий тезис и call-to-action."
        ),
        "rating": 4.6,
    },
    {
        "title": "Продуктовый логотип в минимализме",
        "description": "Промпт для генерации чистого, современного логотипа",
        "category": "design",
        "model_type": "image",
        "prompt_text": (
            "Minimalist logo design for a tech startup, flat vector style, "
            "single accent color on white background, geometric shapes, no text, "
            "clean lines, professional, high contrast, centered composition"
        ),
        "rating": 4.7,
    },
    {
        "title": "Питч-дек за 60 секунд",
        "description": "Сжимает описание продукта в структуру питч-презентации",
        "category": "business",
        "model_type": "text",
        "prompt_text": (
            "У меня есть идея продукта: [опиши идею]. Составь структуру питч-дека из 8 слайдов: "
            "проблема, решение, рынок, продукт, бизнес-модель, конкуренты, команда, ask. "
            "Для каждого слайда дай заголовок и 2-3 тезиса."
        ),
        "rating": 4.5,
    },
    {
        "title": "Атмосферный кинематографичный кадр",
        "description": "Промпт для генерации изображения в стиле кинокадра",
        "category": "design",
        "model_type": "image",
        "prompt_text": (
            "Cinematic still, dramatic lighting, shallow depth of field, moody color grading, "
            "35mm film grain, wide shot, golden hour, photorealistic, highly detailed"
        ),
        "rating": 4.6,
    },
]

NEWS = [
    {
        "title": "Anthropic представила Claude Sonnet 5",
        "summary": "Новая модель показывает улучшенные результаты в рассуждении и агентных задачах.",
        "content": (
            "Anthropic выпустила Claude Sonnet 5 — обновление флагманской линейки моделей "
            "с улучшенными способностями к многошаговым рассуждениям, работе с инструментами "
            "и большим окном контекста."
        ),
        "source_url": "https://www.anthropic.com/news",
    },
    {
        "title": "OpenRouter упростил маршрутизацию между моделями",
        "summary": "Теперь можно переключаться между провайдерами без изменения кода.",
        "content": (
            "OpenRouter добавил единый API для доступа к десяткам языковых моделей от разных "
            "провайдеров, что упрощает A/B тестирование и снижает риски вендор-лока."
        ),
        "source_url": None,
    },
    {
        "title": "Together AI снизила цены на Flux.1 Pro",
        "summary": "Генерация изображения теперь стоит от $0.003 за кадр.",
        "content": (
            "Together AI объявила о снижении цен на инференс модели Flux.1 Pro, что делает "
            "генерацию изображений в приложениях экономически выгоднее."
        ),
        "source_url": None,
    },
]


async def seed() -> None:
    await init_db()
    async with async_session() as db:
        existing = await db.execute(select(Prompt.id).limit(1))
        if existing.scalar_one_or_none() is None:
            db.add_all(Prompt(**p) for p in PROMPTS)

        existing_news = await db.execute(select(NewsItem.id).limit(1))
        if existing_news.scalar_one_or_none() is None:
            db.add_all(NewsItem(**n) for n in NEWS)

        await db.commit()
    print(f"Seeded {len(PROMPTS)} prompts and {len(NEWS)} news items.")


if __name__ == "__main__":
    asyncio.run(seed())
