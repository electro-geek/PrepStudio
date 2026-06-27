from pydantic import BaseModel, Field, field_validator
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

    @field_validator("article_ideas", mode="before")
    @classmethod
    def coerce_idea_objects(cls, v):
        # Older rows may hold Gemini's {"title", "description"} objects in the
        # JSON column; coerce them so serialization never 500s.
        if not isinstance(v, list):
            return v
        return [
            item if isinstance(item, str)
            else item.get("title") or item.get("idea") or str(item)
            if isinstance(item, dict) else str(item)
            for item in v
        ]

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

# ── Lightweight summary schemas for the dashboard list ──────────────────────
# These exclude heavy fields (topic.content, topic.article_ideas) so the
# GET /plans endpoint only fetches what the progress bar actually needs.

class TopicSummaryResponse(BaseModel):
    id: str
    is_complete: bool

    class Config:
        from_attributes = True

class PlanDaySummaryResponse(BaseModel):
    id: str
    topics: List[TopicSummaryResponse] = []

    class Config:
        from_attributes = True

class PlanSummaryResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    total_days: int
    status: str
    created_at: datetime
    days: Optional[List[PlanDaySummaryResponse]] = []

    class Config:
        from_attributes = True

# ── Auth ─────────────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

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

# ── Waitlist ─────────────────────────────────────────────────────────────────

class WaitlistJoin(BaseModel):
    email: str
    name: Optional[str] = None
    feature: str = "audio_lesson"

class WaitlistResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    feature: str
    created_at: datetime
    already_joined: bool = False

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

# ── System Design Track ──────────────────────────────────────────────────────

class SystemDesignTrackCreate(BaseModel):
    total_days: int = Field(..., ge=1, le=30)

class ChallengeSummary(BaseModel):
    id: str
    product: str
    prompt: Optional[str] = None
    difficulty: str
    difficulty_rank: int
    day_number: int
    is_complete: bool

    class Config:
        from_attributes = True

class SystemDesignTrackResponse(BaseModel):
    id: str
    user_id: str
    total_days: int
    status: str
    created_at: datetime
    challenges: List[ChallengeSummary] = []

    class Config:
        from_attributes = True

class SystemDesignTrackSummary(BaseModel):
    id: str
    user_id: str
    total_days: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    functional_reqs: Optional[str] = None
    nonfunctional_reqs: Optional[str] = None
    hld_image: Optional[str] = None
    hld_notes: Optional[str] = None
    lld_text: Optional[str] = None
    lld_image: Optional[str] = None
    evaluation: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ChallengeDetailResponse(BaseModel):
    id: str
    track_id: str
    product: str
    prompt: Optional[str] = None
    difficulty: str
    difficulty_rank: int
    day_number: int
    is_complete: bool
    has_model_answer: bool = False
    submission: Optional[SubmissionResponse] = None

    class Config:
        from_attributes = True

class SubmissionEvaluateRequest(BaseModel):
    functional_reqs: str = ""
    nonfunctional_reqs: str = ""
    hld_image: Optional[str] = None  # base64 data URL
    hld_notes: str = ""
    lld_text: str = ""
    lld_image: Optional[str] = None  # base64 data URL

class DimensionFeedback(BaseModel):
    covered: List[str] = []
    missing: List[str] = []

class SystemDesignEvaluationResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    overall_score: int
    overall_grade: str
    hld_score: int
    lld_score: int
    requirements_score: int
    summary: str
    hld_feedback: DimensionFeedback
    lld_feedback: DimensionFeedback
    requirements_feedback: DimensionFeedback
    model_answer_markdown: str
    model_diagram_mermaid: str

class ModelAnswerResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    product: str
    model_answer_markdown: str
    model_diagram_mermaid: str
