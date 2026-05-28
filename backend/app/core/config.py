import os


class Settings:
    def __init__(self):
        # ── Defaults (local development) ──────────────────────────────────────
        # SQLite is NOT supported on Vercel. Always set DATABASE_URL as an
        # environment variable pointing to a PostgreSQL instance.
        self.DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/learnforge"
        self.GEMINI_API_KEY = ""
        self.ELEVENLABS_API_KEY = ""
        self.FIREBASE_PROJECT_ID = ""
        self.FIREBASE_PRIVATE_KEY = ""
        self.FIREBASE_CLIENT_EMAIL = ""
        self.CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
        self.AUTH_BYPASS = True
        self.JWT_SECRET = "dev-secret-change-in-production"
        self.JWT_EXPIRE_HOURS = 24

        # Load config.properties first (present in local dev, ignored on Vercel)
        self.load_from_properties()

        # Environment variables always win — this is the Vercel-compatible path
        self.DATABASE_URL = os.getenv("DATABASE_URL", self.DATABASE_URL)
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", self.GEMINI_API_KEY)
        self.ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", self.ELEVENLABS_API_KEY)
        self.FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", self.FIREBASE_PROJECT_ID)
        self.FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY", self.FIREBASE_PRIVATE_KEY)
        self.FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL", self.FIREBASE_CLIENT_EMAIL)
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", self.CORS_ORIGINS)
        self.JWT_SECRET = os.getenv("JWT_SECRET", self.JWT_SECRET)
        self.JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", str(self.JWT_EXPIRE_HOURS)))

        bypass_env = os.getenv("AUTH_BYPASS")
        if bypass_env is not None:
            self.AUTH_BYPASS = bypass_env.lower() in ("true", "1", "yes")

    def load_from_properties(self):
        """Load config.properties for local development. Silently skipped on Vercel."""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            # Relative to CWD (when running uvicorn from /backend)
            "config.properties",
            # Relative to this file (backend/app/core/ → backend/)
            os.path.join(current_dir, "..", "..", "config.properties"),
        ]

        filepath = None
        for path in candidates:
            if os.path.exists(path):
                filepath = path
                break

        if not filepath:
            return  # Running on Vercel or another hosted env — use env vars only

        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or line.startswith("!"):
                    continue
                if "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip()

                valid_keys = {
                    "DATABASE_URL", "GEMINI_API_KEY", "ELEVENLABS_API_KEY",
                    "FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY",
                    "FIREBASE_CLIENT_EMAIL", "CORS_ORIGINS", "AUTH_BYPASS",
                    "JWT_SECRET", "JWT_EXPIRE_HOURS",
                }

                if key in valid_keys:
                    if key == "AUTH_BYPASS":
                        self.AUTH_BYPASS = val.lower() in ("true", "1", "yes")
                    else:
                        value = val.replace("\\n", "\n") if key == "FIREBASE_PRIVATE_KEY" else val
                        setattr(self, key, value)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
