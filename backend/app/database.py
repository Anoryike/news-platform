from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.config import settings

_db_url = (
    settings.database_url
    .replace("postgresql://", "postgresql+asyncpg://")
    .split("?")[0]
)

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,
    connect_args={"ssl": True},
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for col in ("image_url VARCHAR", "source_url VARCHAR"):
            name = col.split()[0]
            try:
                await conn.execute(
                    text(f"ALTER TABLE articles ADD COLUMN IF NOT EXISTS {col}")
                )
            except Exception:
                pass
