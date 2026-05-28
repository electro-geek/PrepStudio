from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any

class TopicBase(BaseModel):
    title: str
    is_complete: bool = False

class TopicCreate(TopicBase):
    pass

class TopicResponse(BaseModel):
    id: str
    day_id: str
    title: str
    content: Optional[str] = None
    article_ideas: Optional[List[str]] = None
    is_complete: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PlanDayResponse(BaseModel):
    id: str
    plan_id: str
    day_number: int
    title: Optional[str] = None
    is_complete: bool
    topics: List[TopicResponse] = []

    class Config:
        from_attributes = True

class PlanCreate(BaseModel):
    topic: str
    total_days: int = Field(..., ge=1, le=30)

class PlanResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    total_days: int
    status: str
    created_at: datetime
    days: Optional[List[PlanDayResponse]] = []


    class Config:
        from_attributes = True

class ArticleCreate(BaseModel):
    topic_id: str
    raw_text: str

class ArticleResponse(BaseModel):
    id: str
    topic_id: Optional[str] = None
    user_id: str
    raw_text: Optional[str] = None
    refined_markdown: Optional[str] = None
    twitter_thread: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewStart(BaseModel):
    plan_id: str

class InterviewStartResponse(BaseModel):
    id: str
    first_question: str
    questions: List[str]

class InterviewAnswerSubmit(BaseModel):
    answer: str

class InterviewAnswerResponse(BaseModel):
    next_question: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[Dict[str, Any]] = None
    is_finished: bool

class InterviewResponse(BaseModel):
    id: str
    plan_id: str
    user_id: str
    score: Optional[int] = None
    feedback: Optional[Dict[str, Any]] = None
    questions: Optional[List[str]] = []
    answers: Optional[List[str]] = []
    created_at: datetime

    class Config:
        from_attributes = True

# ── ElevenLabs Voice Feature Schemas ────────────────────────────────────────

class LessonSessionResponse(BaseModel):
    signed_url: str
    agent_id: str
    topic_title: str

class VoiceInterviewSessionRequest(BaseModel):
    question_count: int = 8

class VoiceInterviewSessionResponse(BaseModel):
    signed_url: str
    agent_id: str
    interview_id: str
    questions: List[str]

class EvaluateTranscriptRequest(BaseModel):
    transcript: str

class QuestionFeedback(BaseModel):
    question: str
    score: int
    assessment: str

class TranscriptEvaluationResponse(BaseModel):
    overall_score: int
    overall_grade: str
    summary: str
    strengths: List[str]
    improvements: List[str]
    question_feedback: List[QuestionFeedback]
