import re

import aiohttp

from app.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL_SLUGS = {
    "claude": "anthropic/claude-sonnet-5",
    "gpt4o": "openai/gpt-4o-mini",
}

_CYRILLIC_RE = re.compile(r"[а-яА-ЯёЁ]")


class OpenRouterError(Exception):
    pass


async def chat_completion(
    model: str,
    messages: list[dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 1024,
    response_format: dict | None = None,
) -> dict:
    if not settings.openrouter_api_key:
        raise OpenRouterError("OPENROUTER_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "usage": {"include": True},
    }
    if response_format is not None:
        payload["response_format"] = response_format

    async with aiohttp.ClientSession() as session:
        async with session.post(
            OPENROUTER_URL, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=60)
        ) as resp:
            data = await resp.json()
            if resp.status != 200:
                message = data.get("error", {}).get("message", f"OpenRouter error {resp.status}")
                raise OpenRouterError(message)
            return data


async def translate_to_english(text: str) -> str:
    """Image/video models follow English prompts far more reliably than Russian ones,
    so non-Latin prompts get translated before being sent off to those APIs."""
    if not _CYRILLIC_RE.search(text):
        return text

    try:
        data = await chat_completion(
            MODEL_SLUGS["gpt4o"],
            [
                {
                    "role": "system",
                    "content": (
                        "Translate the user's image generation prompt into concise, vivid English. "
                        "Output only the translated prompt, with no quotes or explanations."
                    ),
                },
                {"role": "user", "content": text},
            ],
            temperature=0.3,
            max_tokens=200,
        )
        translated = data["choices"][0]["message"]["content"].strip()
        return translated or text
    except OpenRouterError:
        return text
