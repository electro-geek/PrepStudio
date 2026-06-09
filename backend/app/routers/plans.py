from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, load_only
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user, UserPayload
from app.models.all import Plan, PlanDay, Topic
from app.schemas.all import PlanCreate, PlanResponse, PlanSummaryResponse
from app.services.plan_service import plan_service

router = APIRouter(tags=["plans"])

@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: PlanCreate,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    try:
        new_plan = await plan_service.create_plan(
            db=db,
            user_id=user.uid,
            topic=payload.topic,
            total_days=payload.total_days,
            email=user.email,
            name=user.name
        )
        return new_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate study plan: {str(e)}"
        )

@router.get("/plans", response_model=List[PlanSummaryResponse])
async def list_plans(
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    # Only load the columns the dashboard actually needs (id + is_complete per
    # topic).  Skipping content (Text) and article_ideas (JSON) cuts the payload
    # from potentially hundreds of KB down to a few KB.
    stmt = (
        select(Plan)
        .filter(Plan.user_id == user.uid)
        .options(
            selectinload(Plan.days).selectinload(PlanDay.topics).load_only(
                Topic.id, Topic.is_complete
            )
        )
        .order_by(Plan.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = (
        select(Plan)
        .filter(Plan.id == plan_id, Plan.user_id == user.uid)
        .options(
            selectinload(Plan.days).selectinload(PlanDay.topics)
        )
    )
    result = await db.execute(stmt)
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    return plan

@router.patch("/days/{day_id}/complete")
async def mark_day_complete(
    day_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    # Find day and ensure it belongs to this user
    day_stmt = (
        select(PlanDay)
        .filter(PlanDay.id == day_id)
        .options(selectinload(PlanDay.plan), selectinload(PlanDay.topics))
    )
    day_result = await db.execute(day_stmt)
    day = day_result.scalar_one_or_none()
    
    if not day or day.plan.user_id != user.uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Day not found"
        )
        
    # Toggle completeness
    day.is_complete = not day.is_complete
    
    # Also optionally toggle completion of all sub-topics on this day
    for topic in day.topics:
        topic.is_complete = day.is_complete
        
    await db.commit()
    return {"id": day.id, "is_complete": day.is_complete}
