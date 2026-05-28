from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.auth import get_current_user, UserPayload
from app.models.all import Interview, Plan, PlanDay, Topic
from app.schemas.all import (
    InterviewStart, InterviewStartResponse, InterviewAnswerSubmit,
    InterviewAnswerResponse, InterviewResponse,
    VoiceInterviewSessionRequest, VoiceInterviewSessionResponse,
    EvaluateTranscriptRequest, TranscriptEvaluationResponse,
)
from app.services.gemini_service import gemini
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter(tags=["interviews"])

@router.post("/interviews", response_model=InterviewStartResponse, status_code=status.HTTP_201_CREATED)
async def start_interview(
    payload: InterviewStart,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    # Fetch plan and load topics to generate custom questions
    stmt = (
        select(Plan)
        .filter(Plan.id == payload.plan_id, Plan.user_id == user.uid)
        .options(selectinload(Plan.days).selectinload(PlanDay.topics))
    )
    result = await db.execute(stmt)
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
        
    # Extract all topic titles
    topics_list = []
    for day in plan.days:
        for topic in day.topics:
            topics_list.append(topic.title)
            
    if not topics_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study plan has no topics to interview on!"
        )
        
    try:
        # Generate 8 questions from topics
        questions = await gemini.generate_interview_questions(
            plan_topic=plan.topic,
            topics_list=topics_list
        )
        
        # Trim to exactly 8 questions if needed
        questions = questions[:8]
        while len(questions) < 8:
            questions.append(f"Can you explain another core concept that you learned in {plan.topic}?")
            
        # Create Interview session
        interview = Interview(
            plan_id=plan.id,
            user_id=user.uid,
            questions=questions,
            answers=[],
            score=None,
            feedback={"q_evaluations": []}
        )
        db.add(interview)
        await db.commit()
        await db.refresh(interview)
        
        return InterviewStartResponse(
            id=interview.id,
            first_question=questions[0],
            questions=questions
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize voice interview: {str(e)}"
        )

@router.post("/interviews/{interview_id}/answer", response_model=InterviewAnswerResponse)
async def submit_answer(
    interview_id: str,
    payload: InterviewAnswerSubmit,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = select(Interview).filter(Interview.id == interview_id, Interview.user_id == user.uid)
    result = await db.execute(stmt)
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
        
    questions = interview.questions or []
    answers = interview.answers or []
    
    q_index = len(answers)
    if q_index >= len(questions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview is already complete!"
        )
        
    current_question = questions[q_index]
    
    try:
        # Evaluate current question
        evaluation = await gemini.evaluate_answer(
            question=current_question,
            answer=payload.answer
        )
        
        # Append answer and evaluation record
        updated_answers = list(answers)
        updated_answers.append(payload.answer)
        interview.answers = updated_answers
        
        feedback_data = dict(interview.feedback or {"q_evaluations": []})
        evaluations = list(feedback_data.get("q_evaluations", []))
        evaluations.append({
            "question_num": q_index + 1,
            "question": current_question,
            "answer": payload.answer,
            "score": evaluation.get("score", 70),
            "strengths": evaluation.get("feedback", {}).get("strengths", ""),
            "improvements": evaluation.get("feedback", {}).get("improvements", "")
        })
        feedback_data["q_evaluations"] = evaluations
        interview.feedback = feedback_data
        
        # Check if finished
        is_finished = len(updated_answers) == len(questions)
        next_q = None
        final_score = None
        final_feedback = None
        
        if is_finished:
            # Aggregate score
            scores = [eval_item.get("score", 70) for eval_item in evaluations]
            final_score = int(sum(scores) / len(scores)) if scores else 0
            interview.score = final_score
            
            # Aggregate qualitative feedback
            strengths_list = [eval_item.get("strengths", "") for eval_item in evaluations if eval_item.get("strengths")]
            improvements_list = [eval_item.get("improvements", "") for eval_item in evaluations if eval_item.get("improvements")]
            
            feedback_data["strengths"] = "\n".join([f"- {s}" for s in strengths_list[:3]])
            feedback_data["improvements"] = "\n".join([f"- {i}" for i in improvements_list[:3]])
            interview.feedback = feedback_data
            
            # Update plan status to complete or keep active
            # (In dashboard, let's keep track of overall stats)
            
            final_feedback = {
                "strengths": feedback_data["strengths"],
                "improvements": feedback_data["improvements"]
            }
        else:
            next_q = questions[len(updated_answers)]
            
        await db.commit()
        
        return InterviewAnswerResponse(
            next_question=next_q,
            score=final_score,
            feedback=final_feedback,
            is_finished=is_finished
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process answer evaluation: {str(e)}"
        )

@router.get("/interviews/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = select(Interview).filter(Interview.id == interview_id, Interview.user_id == user.uid)
    result = await db.execute(stmt)
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    return interview

@router.get("/plans/{plan_id}/interviews", response_model=List[InterviewResponse])
async def list_plan_interviews(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = (
        select(Interview)
        .filter(Interview.plan_id == plan_id, Interview.user_id == user.uid)
        .order_by(Interview.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/plans/{plan_id}/voice-interview-session",
    response_model=VoiceInterviewSessionResponse,
)
async def start_voice_interview_session(
    plan_id: str,
    payload: VoiceInterviewSessionRequest = VoiceInterviewSessionRequest(),
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    stmt = (
        select(Plan)
        .filter(Plan.id == plan_id, Plan.user_id == user.uid)
        .options(selectinload(Plan.days).selectinload(PlanDay.topics))
    )
    result = await db.execute(stmt)
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    topics_list = [t.title for day in plan.days for t in day.topics]
    if not topics_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study plan has no topics to interview on",
        )

    count = max(1, min(payload.question_count, 10))
    questions = await gemini.generate_interview_questions(
        plan_topic=plan.topic, topics_list=topics_list
    )
    questions = questions[:count]
    while len(questions) < count:
        questions.append(f"Explain a core concept you learned in {plan.topic}.")

    interview = Interview(
        plan_id=plan.id,
        user_id=user.uid,
        questions=questions,
        answers=[],
        score=None,
        feedback={},
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)

    try:
        session = await elevenlabs_service.create_interview_session(
            plan_topic=plan.topic, questions=questions
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create interview session: {str(e)}",
        )

    return {
        "signed_url": session["signed_url"],
        "agent_id": session["agent_id"],
        "interview_id": interview.id,
        "questions": questions,
    }


@router.post(
    "/interviews/{interview_id}/evaluate-transcript",
    response_model=TranscriptEvaluationResponse,
)
async def evaluate_interview_transcript(
    interview_id: str,
    payload: EvaluateTranscriptRequest,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    stmt = (
        select(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == user.uid)
        .options(selectinload(Interview.plan))
    )
    result = await db.execute(stmt)
    interview = result.scalar_one_or_none()

    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    evaluation = await gemini.evaluate_interview_transcript(
        plan_topic=interview.plan.topic,
        questions=interview.questions or [],
        transcript=payload.transcript,
    )

    interview.score = evaluation["overall_score"]
    interview.feedback = {
        "overall_grade": evaluation["overall_grade"],
        "summary": evaluation["summary"],
        "strengths": evaluation["strengths"],
        "improvements": evaluation["improvements"],
        "question_feedback": evaluation["question_feedback"],
        "transcript": payload.transcript[:6000],
    }
    await db.commit()

    return evaluation
