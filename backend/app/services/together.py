import aiohttp

from app.config import settings

TOGETHER_URL = "https://api.together.xyz/v1/images/generations"
FLUX_MODEL = "black-forest-labs/FLUX.1.1-pro"
PRICE_PER_MEGAPIXEL = 0.04


class TogetherError(Exception):
    pass


def estimate_cost(width: int, height: int, n: int) -> float:
    megapixels = (width * height) / 1_000_000
    return round(megapixels * PRICE_PER_MEGAPIXEL * n, 4)


async def generate_image(prompt: str, width: int = 1024, height: int = 1024, n: int = 1) -> dict:
    if not settings.together_api_key:
        raise TogetherError("TOGETHER_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {settings.together_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": FLUX_MODEL,
        "prompt": prompt,
        "width": width,
        "height": height,
        "steps": 28,
        "n": n,
        "response_format": "url",
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            TOGETHER_URL, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=60)
        ) as resp:
            data = await resp.json()
            if resp.status != 200:
                message = data.get("error", {}).get("message", f"Together AI error {resp.status}")
                raise TogetherError(message)
            return data
