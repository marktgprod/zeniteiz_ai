from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Supabase's connection pooler runs in transaction mode by default, which is
# incompatible with asyncpg's server-side prepared statement cache. Disabling
# it is a no-op on SQLite/direct Postgres connections, so it's safe to always set.
connect_args = {"statement_cache_size": 0} if settings.database_url.startswith("postgresql+asyncpg") else {}

engine = create_async_engine(settings.database_url, echo=False, connect_args=connect_args)
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
