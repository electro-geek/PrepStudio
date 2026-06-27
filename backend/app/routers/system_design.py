from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.auth import get_current_user, UserPayload
from app.models.all import SystemDesignTrack, SystemDesignChallenge, SystemDesignSubmission
from app.schemas.all import (
    SystemDesignTrackCreate, SystemDesignTrackResponse, SystemDesignTrackSummary,
    ChallengeDetailResponse, SubmissionEvaluateRequest,
    SystemDesignEvaluationResponse, ModelAnswerResponse,
)
from app.services.system_design_service import system_design_service
from app.services.gemini_service import gemini

router = APIRouter(prefix="/system-design", tags=["system-design"])


@router.post("/tracks", response_model=SystemDesignTrackResponse, status_code=status.HTTP_201_CREATED)
async def create_track(
    payload: SystemDesignTrackCreate,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    try:
        return await system_design_service.create_track(
            db=db,
            user_id=user.uid,
            total_days=payload.total_days,
            email=user.email,
            name=user.name,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate system design track: {str(e)}",
        )


@router.get("/tracks", response_model=List[SystemDesignTrackSummary])
async def list_tracks(
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    stmt = (
        select(SystemDesignTrack)
        .filter(SystemDesignTrack.user_id == user.uid)
        .order_by(SystemDesignTrack.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/tracks/{track_id}", response_model=SystemDesignTrackResponse)
async def get_track(
    track_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    stmt = (
        select(SystemDesignTrack)
        .filter(SystemDesignTrack.id == track_id, SystemDesignTrack.user_id == user.uid)
        .options(selectinload(SystemDesignTrack.challenges))
    )
    result = await db.execute(stmt)
    track = result.scalar_one_or_none()
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")
    return track


async def _load_owned_challenge(db: AsyncSession, challenge_id: str, uid: str) -> SystemDesignChallenge:
    stmt = (
        select(SystemDesignChallenge)
        .filter(SystemDesignChallenge.id == challenge_id)
        .options(
            selectinload(SystemDesignChallenge.track),
            selectinload(SystemDesignChallenge.submission),
        )
    )
    result = await db.execute(stmt)
    challenge = result.scalar_one_or_none()
    if not challenge or challenge.track.user_id != uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    return challenge


@router.get("/challenges/{challenge_id}", response_model=ChallengeDetailResponse)
async def get_challenge(
    challenge_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    challenge = await _load_owned_challenge(db, challenge_id, user.uid)
    return ChallengeDetailResponse(
        id=challenge.id,
        track_id=challenge.track_id,
        product=challenge.product,
        prompt=challenge.prompt,
        difficulty=challenge.difficulty,
        difficulty_rank=challenge.difficulty_rank,
        day_number=challenge.day_number,
        is_complete=challenge.is_complete,
        has_model_answer=bool(challenge.model_answer_markdown),
        submission=challenge.submission,
    )


@router.post("/challenges/{challenge_id}/evaluate", response_model=SystemDesignEvaluationResponse)
async def evaluate_challenge(
    challenge_id: str,
    payload: SubmissionEvaluateRequest,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    challenge = await _load_owned_challenge(db, challenge_id, user.uid)

    try:
        evaluation = await gemini.evaluate_system_design(
            product=challenge.product,
            prompt=challenge.prompt or "",
            functional=payload.functional_reqs,
            nonfunctional=payload.nonfunctional_reqs,
            hld_image=payload.hld_image,
            hld_notes=payload.hld_notes,
            lld_text=payload.lld_text,
            lld_image=payload.lld_image,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate submission: {str(e)}",
        )

    # Upsert the single submission for this challenge.
    submission = challenge.submission
    if submission is None:
        submission = SystemDesignSubmission(challenge_id=challenge.id, user_id=user.uid)
        db.add(submission)

    submission.functional_reqs = payload.functional_reqs
    submission.nonfunctional_reqs = payload.nonfunctional_reqs
    submission.hld_image = payload.hld_image
    submission.hld_notes = payload.hld_notes
    submission.lld_text = payload.lld_text
    submission.lld_image = payload.lld_image
    submission.evaluation = evaluation

    # Cache the model answer on the challenge + mark complete.
    challenge.model_answer_markdown = evaluation["model_answer_markdown"]
    challenge.model_diagram_mermaid = evaluation["model_diagram_mermaid"]
    challenge.is_complete = True

    await db.commit()
    return evaluation


@router.get("/challenges/{challenge_id}/solution", response_model=ModelAnswerResponse)
async def get_solution(
    challenge_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    challenge = await _load_owned_challenge(db, challenge_id, user.uid)

    # Fast path: cached.
    if challenge.model_answer_markdown and challenge.model_diagram_mermaid:
        return ModelAnswerResponse(
            product=challenge.product,
            model_answer_markdown=challenge.model_answer_markdown,
            model_diagram_mermaid=challenge.model_diagram_mermaid,
        )

    try:
        solution = await gemini.generate_system_design_solution(
            product=challenge.product,
            prompt=challenge.prompt or "",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate solution: {str(e)}",
        )

    challenge.model_answer_markdown = solution["model_answer_markdown"]
    challenge.model_diagram_mermaid = solution["model_diagram_mermaid"]
    await db.commit()

    return ModelAnswerResponse(
        product=challenge.product,
        model_answer_markdown=solution["model_answer_markdown"],
        model_diagram_mermaid=solution["model_diagram_mermaid"],
    )
