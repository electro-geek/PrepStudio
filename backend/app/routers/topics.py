import asyncio
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified
from app.core.database import get_db
from app.core.auth import get_current_user, UserPayload
from app.models.all import Topic, PlanDay, Plan
from app.schemas.all import TopicResponse, LessonSessionResponse
from app.services.gemini_service import gemini
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter(tags=["topics"])

# Per-topic asyncio locks: prevents two simultaneous requests for the same
# uncached topic from both calling Gemini and wasting quota.
# Works correctly for single-server deployments.
_generation_locks: dict[str, asyncio.Lock] = {}


@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = (
        select(Topic)
        .filter(Topic.id == topic_id)
        .options(selectinload(Topic.day).selectinload(PlanDay.plan))
    )
    result = await db.execute(stmt)
    topic = result.scalar_one_or_none()

    if not topic or topic.day.plan.user_id != user.uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    # Fast path: content already persisted — return immediately, zero AI calls
    if topic.content:
        response.headers["X-Content-Source"] = "cache"
        return topic

    # Slow path: content not yet generated.
    # Use a per-topic lock so that if two requests arrive simultaneously for the
    # same uncached topic, only the first one calls Gemini; the second re-checks
    # the DB inside the lock and returns the already-saved content.
    if topic_id not in _generation_locks:
        _generation_locks[topic_id] = asyncio.Lock()

    async with _generation_locks[topic_id]:
        # Re-check after acquiring the lock — a concurrent waiter may have just
        # generated and committed the content.
        await db.refresh(topic)
        if topic.content:
            response.headers["X-Content-Source"] = "cache"
            return topic

        plan_topic  = topic.day.plan.topic
        topic_title = topic.title
        day_title   = topic.day.title

        try:
            generated = await gemini.generate_topic_content(
                plan_topic=plan_topic,
                topic_title=topic_title,
                day_title=day_title,
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI generation failed: {str(e)}",
            )

        content = (generated.get("content") or "").strip()
        article_ideas = generated.get("article_ideas") or []

        # Guarantee non-empty content — fall back to mock so we never persist
        # an empty string (which is falsy and would trigger re-generation forever).
        if not content:
            fallback = gemini._mock_content(plan_topic, topic_title)
            content = fallback["content"]
            article_ideas = fallback.get("article_ideas", article_ideas)

        topic.content = content
        topic.article_ideas = article_ideas
        # flag_modified tells SQLAlchemy the JSON column was reassigned so it
        # always includes it in the UPDATE statement.
        flag_modified(topic, "article_ideas")
        # get_db commits the transaction after this handler returns — do NOT
        # manually commit here; double-commits cause subtle session issues.

    response.headers["X-Content-Source"] = "generated"
    return topic


@router.patch("/topics/{topic_id}/complete")
async def mark_topic_complete(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = (
        select(Topic)
        .filter(Topic.id == topic_id)
        .options(
            selectinload(Topic.day).selectinload(PlanDay.topics),
            selectinload(Topic.day).selectinload(PlanDay.plan)
        )
    )
    result = await db.execute(stmt)
    topic = result.scalar_one_or_none()

    if not topic or topic.day.plan.user_id != user.uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )

    topic.is_complete = not topic.is_complete

    # Auto-update day completeness based on all its topics
    day = topic.day
    day.is_complete = all(t.is_complete for t in day.topics)

    await db.commit()
    return {
        "id": topic.id,
        "is_complete": topic.is_complete,
        "day_id": day.id,
        "day_complete": day.is_complete
    }


@router.post("/topics/{topic_id}/lesson-session", response_model=LessonSessionResponse)
async def start_lesson_session(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    stmt = (
        select(Topic)
        .filter(Topic.id == topic_id)
        .options(selectinload(Topic.day).selectinload(PlanDay.plan))
    )
    result = await db.execute(stmt)
    topic = result.scalar_one_or_none()

    if not topic or topic.day.plan.user_id != user.uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    if not topic.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic content not generated yet. Open the topic page first to generate it.",
        )

    try:
        session = await elevenlabs_service.create_lesson_session(
            topic_title=topic.title,
            plan_topic=topic.day.plan.topic,
            content=topic.content,
        )
        return session
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create lesson session: {str(e)}",
        )
