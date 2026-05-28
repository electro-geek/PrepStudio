import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "app_users"
    
    id = Column(String, primary_key=True)  # Firebase UID
    email = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    plans = relationship("Plan", back_populates="user", cascade="all, delete-orphan")
    articles = relationship("Article", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("app_users.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String, nullable=False)
    total_days = Column(Integer, nullable=False)
    status = Column(String, default="active")  # active | complete
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="plans")
    days = relationship("PlanDay", back_populates="plan", cascade="all, delete-orphan", order_by="PlanDay.day_number")
    interviews = relationship("Interview", back_populates="plan", cascade="all, delete-orphan")

class PlanDay(Base):
    __tablename__ = "plan_days"
    __table_args__ = (Index("ix_plan_days_plan_id", "plan_id"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, nullable=False)
    title = Column(String, nullable=True)
    is_complete = Column(Boolean, default=False)

    plan = relationship("Plan", back_populates="days")
    topics = relationship("Topic", back_populates="day", cascade="all, delete-orphan", order_by="Topic.created_at")

class Topic(Base):
    __tablename__ = "topics"
    __table_args__ = (Index("ix_topics_day_id", "day_id"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    day_id = Column(String, ForeignKey("plan_days.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)  # Lazy-generated markdown content
    article_ideas = Column(JSON, nullable=True)  # List of article idea strings
    is_complete = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    day = relationship("PlanDay", back_populates="topics")
    articles = relationship("Article", back_populates="topic", cascade="all, delete-orphan")

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String, ForeignKey("app_users.id", ondelete="CASCADE"), nullable=False)
    raw_text = Column(Text, nullable=True)
    refined_markdown = Column(Text, nullable=True)
    twitter_thread = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="articles")
    topic = relationship("Topic", back_populates="articles")

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("app_users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=True)
    feedback = Column(JSON, nullable=True)  # { strengths: "...", improvements: "..." }
    questions = Column(JSON, nullable=True) # list[str]
    answers = Column(JSON, nullable=True)  # list[str]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="interviews")
    plan = relationship("Plan", back_populates="interviews")
