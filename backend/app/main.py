from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import plans, topics, articles, interviews


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    print("[PrepStudio] Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[PrepStudio] Database ready.")
    print(f"[PrepStudio] Auth Bypass: {settings.AUTH_BYPASS}")
    yield
    # ── Shutdown (nothing to clean up for now) ────────────────────────────────


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
