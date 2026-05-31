# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (Next.js 14)
```bash
cd frontend
npm install          # install deps
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
```

### Backend (FastAPI)
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Run dev server
uvicorn app.main:app --reload --port 8000

# Database migrations (Alembic)
alembic upgrade head                          # apply pending migrations
alembic revision --autogenerate -m "message"  # generate a new migration
```

## Architecture

PrepStudio is a split monorepo: `frontend/` (Next.js 14 App Router) + `backend/` (FastAPI async) + an `admin/` directory. There is no monorepo tooling — each side is run independently.

### Authentication Flow
Two-token system to avoid Firebase verification on every request:
1. Frontend calls Firebase Auth (Google OAuth or email/password)
2. On login, `authStore.ts` immediately POSTs the Firebase ID token to `POST /auth/token`
3. Backend verifies it once against Firebase Admin SDK, issues its own short-lived HS256 JWT (`jwt_utils.py`)
4. All subsequent API calls use the backend JWT — Firebase is never touched again unless the JWT expires (~24h)
5. `api.ts` Axios interceptor calls `getBackendToken()` before every request; returns cached JWT or silently re-exchanges

`AUTH_BYPASS=true` (the default in `config.properties`) skips all auth for local development.

### Backend Structure (`backend/app/`)
- `core/config.py` — `Settings` class reads from `config.properties` first, then env vars win. Config file is local-only; production uses env vars.
- `core/database.py` — Async SQLAlchemy with `NullPool` (required for Nile DB / PgBouncer transaction-mode pooling). Never add a connection pool here.
- `core/auth.py` — `get_current_user` FastAPI dependency. Tries backend JWT first (fast path, no network), falls back to Firebase token verification (legacy/first-request path).
- `models/all.py` — All SQLAlchemy ORM models in a single file: `User`, `Plan`, `PlanDay`, `Topic`, `Article`, `Interview`.
- `schemas/all.py` — All Pydantic request/response schemas.
- `routers/` — One file per resource: `plans.py`, `topics.py`, `articles.py`, `interviews.py`, `auth.py`.
- `services/gemini_service.py` — Gemini 2.5 Flash calls (plan generation, topic content, article refinement, interview evaluation).
- `services/elevenlabs_service.py` — Creates ephemeral ElevenLabs Conversational AI agents per session, returns a signed WebSocket URL. Agents are created fresh each call and not reused.
- `services/plan_service.py` — Orchestrates plan creation: calls Gemini, persists `Plan` + `PlanDay` + `Topic` rows.

### Frontend Structure (`frontend/src/`)
- `app/` — Next.js App Router. Routes: `/` (landing), `/dashboard`, `/new`, `/plan/[id]`, `/plan/[id]/day/[dayId]/topic/[topicId]`, `/plan/[id]/interview`, `/plan/[id]/topic/[topicId]/article`, `/privacy`, `/terms`. Auth routes in `(auth)/`.
- `store/authStore.ts` — Zustand store managing Firebase user state and backend JWT lifecycle. The `getBackendToken()` method is the single source of truth for token access.
- `store/interviewStore.ts` — Zustand store for voice interview session state.
- `hooks/useElevenLabsConversation.ts` — Wraps `@11labs/react`'s `useConversation`. Detects `INTERVIEW_COMPLETE` in AI messages and fires `onInterviewComplete` callback with the full transcript string.
- `hooks/useVoice.ts` — Simpler voice hook for the Audio Lesson (Nova tutor) flow.
- `lib/api.ts` — Axios instance with auth interceptor. Import this for all API calls.
- `lib/firebase.ts` — Firebase initialization. Import `auth` from here.

### ElevenLabs Voice Sessions
Both voice features follow the same pattern:
1. Frontend POSTs to backend to start a session
2. Backend calls Gemini (interviews only) to generate questions, then builds a system prompt
3. Backend calls `ElevenLabs Agents API` to create an agent, gets a signed WebSocket URL
4. Backend returns the signed URL to frontend
5. Frontend connects via `useElevenLabsConversation` / `useVoice` hooks using `@11labs/react`

The `INTERVIEW_COMPLETE` sentinel is a literal string the Alex agent is instructed to say; the frontend hook watches for it to trigger transcript evaluation.

### Database
PostgreSQL via Nile DB (production). All models are in `backend/app/models/all.py`. Alembic manages schema migrations — the single migration file is at `backend/alembic/versions/`. At startup: `RUN_MIGRATIONS=true` runs Alembic; otherwise `create_all` is used (safe for dev).

`Topic.content` is lazily generated: `GET /topics/:id` generates and caches Gemini content on first request. Subsequent calls return the cached `content` column value.

### Configuration
- **Backend local dev**: `backend/config.properties` (copy from `config.properties.example`). Key settings: `AUTH_BYPASS`, `DATABASE_URL`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, Firebase credentials, `JWT_SECRET`.
- **Frontend local dev**: `frontend/.env.local`. Key settings: `NEXT_PUBLIC_API_URL`, Firebase client-side config (`NEXT_PUBLIC_FIREBASE_*`).
- **Production**: All settings via environment variables; `config.properties` is not present.

### Deployment
- Frontend: Vercel
- Backend: Custom host with `RUN_MIGRATIONS=true` env var set to trigger Alembic on startup
- `backend/vercel.json` exists for optional Vercel serverless backend deployment
