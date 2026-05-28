"""
Alembic environment — async PostgreSQL (asyncpg) setup.

How it works
------------
* Online mode  : creates a temporary async engine, runs migrations inside
                 `connection.run_sync(do_run_migrations)`, then disposes.
* Offline mode : emits raw SQL to stdout (useful for reviewing before applying).

Database URL
------------
Alembic reads DATABASE_URL from the same source as the app (config.properties
for local dev, DATABASE_URL environment variable in production).  Never
hardcoded here.

Running migrations
------------------
  # From backend/ directory
  alembic upgrade head            # apply all pending migrations
  alembic downgrade -1            # roll back the latest migration
  alembic revision --autogenerate -m "describe_change"   # generate new migration
  alembic current                 # show current DB revision
  alembic history --verbose       # show all migrations
  alembic stamp head              # mark current schema as up-to-date (no SQL run)
"""

import asyncio
import re
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# ── App imports ───────────────────────────────────────────────────────────────
# Import Base first, then all models so SQLAlchemy's MetaData is fully
# populated before Alembic inspects it for autogenerate.
from app.core.database import Base
from app.models import all as _models_module  # noqa: F401 — registers models
from app.core.config import settings

# ── Alembic Config object ─────────────────────────────────────────────────────
config = context.config

# Wire up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# The metadata Alembic compares against when autogenerating migrations
target_metadata = Base.metadata


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_url() -> str:
    """
    Return the database URL, preferring a CLI override (-x db_url=...) over
    the app settings.  This lets you point at a staging DB without touching
    config files:
        alembic -x db_url=postgresql+asyncpg://... upgrade head
    """
    return context.get_x_argument(as_dictionary=True).get("db_url") or settings.DATABASE_URL


def _sync_url(url: str) -> str:
    """
    Convert an asyncpg URL to a plain psycopg2-style URL for offline mode.
    Offline mode never opens a real connection, but the dialect must be sync.
    """
    return re.sub(r"\+asyncpg", "", url)


def _engine_kwargs(url: str) -> dict:
    """Connection args that keep asyncpg happy with PgBouncer / NileDB."""
    if url.startswith("sqlite"):
        return {}
    return {"connect_args": {"statement_cache_size": 0}}


# ── Migration runners ─────────────────────────────────────────────────────────

def run_migrations_offline() -> None:
    """
    Generate a .sql script without connecting to the database.
    Useful for reviewing exactly what SQL will be executed before applying.
    """
    url = _sync_url(_get_url())
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        include_name=_include_name,
    )
    with context.begin_transaction():
        context.run_migrations()


def _include_name(name: str, type_: str, parent_names) -> bool:
    """
    Only let Alembic manage tables that are explicitly defined in our models.
    This prevents Alembic from trying to drop NileDB/PgBouncer system tables
    (tenants, users, tenant_users, etc.) that exist in the DB but are not ours.
    """
    if type_ == "table":
        return name in target_metadata.tables
    return True


def do_run_migrations(connection) -> None:
    """Run migrations synchronously inside an already-open connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
        include_name=_include_name,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Connect to the real DB with an async engine and run migrations."""
    url = _get_url()
    connectable = create_async_engine(
        url,
        poolclass=pool.NullPool,  # one-shot connection — migrations are infrequent
        **_engine_kwargs(url),
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


# ── Entry point ───────────────────────────────────────────────────────────────

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
