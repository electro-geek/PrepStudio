# Vercel serverless entry point for the FastAPI app.
# Vercel's @vercel/python runtime looks for an `app` variable in this file.
from app.main import app  # noqa: F401  — re-exported as the ASGI handler
