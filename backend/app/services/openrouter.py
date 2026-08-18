import aiohttp

from app.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL_SLUGS = {
    "claude": "anthropic/claude-sonnet-5",
    "gpt4o": "openai/gpt-4o-mini",
}


class OpenRouterError(Exception):
    pass


async def chat_completion(model: str, prompt: str, temperature: float = 0.7, max_tokens: int = 1024) -> dict:
    if not settings.openrouter_api_key:
        raise OpenRouterError("OPENROUTER_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "usage": {"include": True},
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            OPENROUTER_URL, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=60)
        ) as resp:
            data = await resp.json()
            if resp.status != 200:
                message = data.get("error", {}).get("message", f"OpenRouter error {resp.status}")
                raise OpenRouterError(message)
            return data
