from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.auth import get_current_user, UserPayload
from app.models.all import Topic, PlanDay, Plan
from app.schemas.all import TopicResponse, LessonSessionResponse
from app.services.gemini_service import gemini
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter(tags=["topics"])

@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    # ── Step 1: Fetch topic with its parent chain ────────────────
    stmt = (
        select(Topic)
        .filter(Topic.id == topic_id)
        .options(
            selectinload(Topic.day).selectinload(PlanDay.plan)
        )
    )
    result = await db.execute(stmt)
    topic = result.scalar_one_or_none()

    if not topic or topic.day.plan.user_id != user.uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    # ── Step 2: Return cached content immediately if it exists ───
    # The content column is populated once and stored permanently.
    # Subsequent requests NEVER call the Gemini API again.
    if topic.content:
        return topic

    # ── Step 3: Content not yet generated — call Gemini once ─────
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
            detail=f"AI generation failed: {str(e)}"
        )

    # ── Step 4: Persist to DB so it is never regenerated ─────────
    try:
        topic.content       = generated.get("content", "") or ""
        topic.article_ideas = generated.get("article_ideas", []) or []
        db.add(topic)
        await db.flush()   # write to transaction buffer
        await db.commit()  # permanently commit to PostgreSQL
        await db.refresh(topic)  # reload the saved row
    except Exception as e:
        await db.rollback()
        # Even if save fails, return the generated content so the
        # user isn't blocked — it will be regenerated next visit.
        print(f"[WARN] Failed to cache lecture content for {topic_id}: {e}")

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
    all_complete = all(t.is_complete for t in day.topics)
    day.is_complete = all_complete
    
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
