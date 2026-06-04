# PrepStudio

**PrepStudio** is a full-stack AI-powered study and interview preparation platform. It combines a Next.js 14 frontend with a FastAPI async backend to deliver a complete learning experience — from AI-generated curricula to live voice-based mock interviews.

---

## Core Concept

The product solves a specific problem: most learners know *what* they want to study but have no structured path, no one to explain concepts interactively, and no way to test if they actually retained anything. PrepStudio fills all three gaps using a pipeline of AI services — Gemini 2.5 Flash for content intelligence and ElevenLabs Conversational AI for voice interaction.

---

## User Journey

### 1. Onboarding & Auth

Users sign in via Firebase (Google OAuth or email/password). The app avoids repeated Firebase token verification by exchanging the Firebase ID token for a short-lived HS256 backend JWT once, caching it, and using it for all subsequent API calls. This is managed entirely by a Zustand store (`authStore.ts`) and an Axios interceptor.

### 2. Plan Creation (`/new`)

The user enters a topic (e.g. "Django REST Framework") and a duration in days. Gemini 2.5 Flash generates a structured day-by-day curriculum — each day has a title and 2–4 topics, each with a one-sentence summary. The entire plan is persisted in PostgreSQL as a `Plan → PlanDay → Topic` tree.

### 3. Plan Dashboard (`/plan/[id]`)

A dark-themed, sidebar-driven UI shows the full curriculum. A progress ring tracks completion percentage across all topics. The mock interview is **gated at 80% completion** — users can't skip ahead without actually studying. Each day's topics show completion state (circle → checkmark).

### 4. Topic Deep Dive (`/plan/[id]/day/[dayId]/topic/[topicId]`)

Topic content is **lazily generated** — the first GET to a topic calls Gemini and caches the result in the `content` column. Subsequent visits are instant database reads. The content is rich Markdown: introduction with analogy, core concepts with subheadings, code examples, and a "gotchas" section.

On the same page, users can launch a **Live Audio Lesson** powered by ElevenLabs. This creates a fresh Conversational AI agent ("Nova, the tutor") with the topic content injected as a system prompt. Nova opens with a hook question, uses analogies, checks for understanding, and closes with 3 key takeaways. The session is a real-time bidirectional voice WebSocket via `@11labs/react`.

### 5. Article Refiner (`/plan/[id]/day/[dayId]/topic/[topicId]/article`)

After studying, users can write raw notes (stream-of-consciousness, bullet points, fragments). Gemini refines them into a polished Markdown blog post **plus** a ready-to-paste Twitter/X thread with 4–6 numbered tweets. Both outputs are copyable with a single click. Each topic also surfaces 3 Gemini-generated article ideas as writing prompts.

### 6. Voice Mock Interview (`/plan/[id]/interview`)

The capstone feature. Backend calls Gemini to generate 8 technical interview questions based on all topics covered in the plan. It then creates an ElevenLabs Conversational AI agent named "Alex" — a strict senior technical interviewer — with those questions injected in order. Alex greets the user, asks questions one at a time, acknowledges without hinting correctness, and ends with the literal sentinel string `INTERVIEW_COMPLETE`.

The frontend hook (`useElevenLabsConversation`) watches for this sentinel in AI messages. When detected, it fires an `onInterviewComplete` callback with the full conversation transcript, which is POSTed to Gemini for holistic evaluation. The result is a structured scorecard: **overall score (0–100), letter grade, summary, 3 strengths, 3 improvement areas, and per-question scores with assessments**.

A live transcript pane displays the conversation in real time. A waveform animation shows when Alex is speaking.

---

## Technical Architecture

| Layer | Stack |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, Axios, `@11labs/react`, `react-markdown` |
| Backend | FastAPI (async), SQLAlchemy (async), Pydantic, Alembic |
| Database | PostgreSQL via Nile DB (PgBouncer transaction-mode, `NullPool` required) |
| Auth | Firebase Admin SDK → backend HS256 JWT exchange |
| AI — Content | Gemini 2.5 Flash (plan generation, topic content, article refinement, interview Q gen, transcript evaluation) |
| AI — Voice | ElevenLabs Conversational AI API (ephemeral agents per session, signed WebSocket URLs) |
| Deployment | Vercel (frontend), custom host with `RUN_MIGRATIONS=true` Alembic startup (backend) |

**No connection pooling** — by design. Nile DB uses PgBouncer in transaction mode, which is incompatible with persistent connection pools, so `NullPool` is hardcoded in `database.py`.

**ElevenLabs agents are stateless** — a new agent is created for every session and never reused. The backend POSTs to the Agents API, gets a signed WebSocket URL, and hands it directly to the frontend. The frontend owns the WebSocket lifecycle.

**Gemini fallback** — every Gemini call has a rich mock fallback that produces realistic-looking data, so the app is fully functional without API keys during development.

---

## Data Model

```
User (Firebase UID)
 └── Plan (topic, duration, status)
      └── PlanDay (day_number, title, is_complete)
           └── Topic (title, content [lazy], article_ideas, is_complete)
                └── Article (raw_text, refined_markdown, twitter_thread)
 └── Interview (plan_id, score, feedback JSON, questions JSON, answers JSON)
```

---

## Design Language

The UI is a high-contrast dark theme (`#080c14` background, indigo/violet accent palette). The brand identity uses a custom SVG logo mark — a stylized "P" shape with ascending bar-chart elements — rendered with a `useId`-based gradient to ensure unique SVG IDs across multiple instances. The landing page features a scrolling marquee of feature names, a step-by-step how-it-works section, and a features grid. All interactive states use subtle ring/glow effects rather than heavy shadows.
