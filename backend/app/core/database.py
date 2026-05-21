from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    connect_args = {"check_same_thread": False}
else:
    # NileDB/PgBouncer uses transaction-mode pooling.
    # Disable prepared-statement caching so asyncpg doesn't
    # try to reuse named server-side statements across connections.
    connect_args = {"statement_cache_size": 0}

engine_kwargs: dict = {"echo": False, "connect_args": connect_args}

if is_sqlite:
    # SQLite needs the default pool; NullPool breaks it
    pass
else:
    # Disable SQLAlchemy's own connection pool entirely.
    # Each request grabs a fresh connection from PgBouncer and
    # returns it immediately, avoiding ALL stale-connection errors.
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
