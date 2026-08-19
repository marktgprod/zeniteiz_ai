import aiohttp

from app.config import settings

FAL_QUEUE_URL = "https://queue.fal.run"
MINIMAX_MODEL = "fal-ai/minimax/video-01-live"
# Queue status/result polling is scoped to the app namespace, not the specific
# sub-endpoint used to submit — confirmed against fal's own status_url response.
MINIMAX_APP = "fal-ai/minimax"


class FalError(Exception):
    pass


def _headers() -> dict[str, str]:
    if not settings.fal_api_key:
        raise FalError("FAL_API_KEY is not configured")
    return {
        "Authorization": f"Key {settings.fal_api_key}",
        "Content-Type": "application/json",
    }


async def submit_video(prompt: str) -> str:
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{FAL_QUEUE_URL}/{MINIMAX_MODEL}",
            json={"prompt": prompt},
            headers=_headers(),
            timeout=aiohttp.ClientTimeout(total=30),
        ) as resp:
            data = await resp.json()
            if resp.status not in (200, 202):
                message = data.get("detail") or data.get("error") or f"FAL error {resp.status}"
                raise FalError(str(message))
            return data["request_id"]


async def get_video_status(request_id: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{FAL_QUEUE_URL}/{MINIMAX_APP}/requests/{request_id}/status",
            headers=_headers(),
            timeout=aiohttp.ClientTimeout(total=15),
        ) as resp:
            data = await resp.json()
            if resp.status not in (200, 202):
                message = data.get("detail") or data.get("error") or f"FAL error {resp.status}"
                raise FalError(str(message))
            return data


async def get_video_result(request_id: str) -> str:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{FAL_QUEUE_URL}/{MINIMAX_APP}/requests/{request_id}",
            headers=_headers(),
            timeout=aiohttp.ClientTimeout(total=15),
        ) as resp:
            data = await resp.json()
            if resp.status != 200:
                message = data.get("detail") or data.get("error") or f"FAL error {resp.status}"
                raise FalError(str(message))
            return data["video"]["url"]
