from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, images, news, payments, prompts, text, video

app = FastAPI(title="AI All-in-One Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(text.router)
app.include_router(images.router)
app.include_router(video.router)
app.include_router(prompts.router)
app.include_router(news.router)
app.include_router(payments.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
