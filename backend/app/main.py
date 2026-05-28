import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import plans, topics, articles, interviews, auth


def _run_alembic_upgrade() -> None:
    """
    Apply any pending Alembic migrations synchronously.
    Called once at startup in production (RUN_MIGRATIONS=true).
    Alembic's own async engine inside env.py handles the DB connection.
    """
    from alembic.config import Config
    from alembic import command
    import os

    # alembic.ini lives one level above this file (backend/)
    ini_path = os.path.join(os.path.dirname(__file__), "..", "alembic.ini")
    cfg = Config(os.path.abspath(ini_path))
    command.upgrade(cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    import os
    run_migrations = os.getenv("RUN_MIGRATIONS", "false").lower() in ("true", "1", "yes")

    if run_migrations:
        # Production: let Alembic manage the schema.
        # Run in a thread so we don't block the async event loop.
        print("[PrepStudio] Running Alembic migrations...")
        await asyncio.to_thread(_run_alembic_upgrade)
        print("[PrepStudio] Migrations complete.")
    else:
        # Development fallback: create_all is safe for local SQLite/Postgres
        # where Alembic hasn't been stamped yet.  It is a no-op for tables
        # that already exist.
        print("[PrepStudio] Syncing database schema (create_all)...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[PrepStudio] Database ready.")

    print(f"[PrepStudio] Auth Bypass: {settings.AUTH_BYPASS}")
    yield
    # ── Shutdown (nothing to clean up) ───────────────────────────────────────


app = FastAPI(
    title="PrepStudio API",
    description="AI-powered study, voice interview, and article refinement platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(plans.router)
app.include_router(topics.router)
app.include_router(articles.router)
app.include_router(interviews.router)


@app.get("/")
def health_check():
    return {
        "name": "PrepStudio API",
        "status": "online",
        "auth_bypass": settings.AUTH_BYPASS,
    }
