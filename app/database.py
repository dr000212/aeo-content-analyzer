"""Async SQLAlchemy engine + session. Supports SQLite (local) and Postgres (Render)."""
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


def _normalize_db_url(raw: str) -> tuple[str, dict]:
    """Normalize DATABASE_URL for async drivers. Returns (url, connect_args)."""
    connect_args: dict = {}
    if not raw:
        return raw, connect_args

    # Normalize scheme: postgres:// or postgresql:// -> postgresql+asyncpg://
    if raw.startswith("postgres://"):
        raw = "postgresql+asyncpg://" + raw[len("postgres://"):]
    elif raw.startswith("postgresql://"):
        raw = "postgresql+asyncpg://" + raw[len("postgresql://"):]

    # asyncpg doesn't understand libpq's `sslmode` query param — strip it and
    # pass ssl via connect_args instead.
    if "+asyncpg" in raw:
        parts = urlsplit(raw)
        query = dict(parse_qsl(parts.query))
        sslmode = query.pop("sslmode", None)
        if sslmode in ("require", "verify-ca", "verify-full", "prefer", "allow"):
            connect_args["ssl"] = True
        raw = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

    return raw, connect_args


_db_url, _connect_args = _normalize_db_url(settings.database_url)

engine = create_async_engine(_db_url, echo=False, future=True, connect_args=_connect_args)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    """FastAPI dependency that yields an async session."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    """Create all tables on startup. Safe to call repeatedly."""
    # Import models so they register with Base.metadata
    from app.models import db_models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
