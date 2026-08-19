from urllib.parse import urlparse

import aiohttp
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["download"])

# Generated media is hosted on our AI providers' CDNs, which don't set CORS
# headers that would let the frontend fetch() the bytes directly. Proxying
# through our own origin (which we do control CORS for) makes in-app
# downloads work reliably instead of falling back to "open external link".
ALLOWED_SUFFIXES = (".together.ai", ".together.xyz", ".fal.media", ".fal.run")


def _is_allowed(url: str) -> bool:
    host = urlparse(url).hostname or ""
    return any(host.endswith(suffix) for suffix in ALLOWED_SUFFIXES)


@router.get("/api/download")
async def download_proxy(url: str, filename: str = "file") -> StreamingResponse:
    if not url.startswith("https://") or not _is_allowed(url):
        raise HTTPException(status_code=400, detail="URL not allowed")

    session = aiohttp.ClientSession()
    try:
        resp = await session.get(url, timeout=aiohttp.ClientTimeout(total=60))
    except aiohttp.ClientError as exc:
        await session.close()
        raise HTTPException(status_code=502, detail="Не удалось загрузить файл") from exc

    if resp.status != 200:
        resp.release()
        await session.close()
        raise HTTPException(status_code=502, detail=f"Upstream error {resp.status}")

    content_type = resp.headers.get("Content-Type", "application/octet-stream")
    safe_filename = filename.replace('"', "")

    async def stream():
        try:
            async for chunk in resp.content.iter_chunked(65536):
                yield chunk
        finally:
            await session.close()

    return StreamingResponse(
        stream(),
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{safe_filename}"'},
    )
