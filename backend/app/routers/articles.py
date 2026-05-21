from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.auth import get_current_user, UserPayload
from app.models.all import Article, Topic
from app.schemas.all import ArticleCreate, ArticleResponse
from app.services.gemini_service import gemini

router = APIRouter(tags=["articles"])

@router.post("/articles", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    payload: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    # Verify topic exists
    topic_stmt = select(Topic).filter(Topic.id == payload.topic_id)
    topic_res = await db.execute(topic_stmt)
    topic = topic_res.scalar_one_or_none()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
        
    # Check if article already exists for this topic by this user
    existing_stmt = select(Article).filter(Article.topic_id == payload.topic_id, Article.user_id == user.uid)
    existing_res = await db.execute(existing_stmt)
    article = existing_res.scalar_one_or_none()
    
    if article:
        # Update raw text
        article.raw_text = payload.raw_text
    else:
        # Create new
        article = Article(
            topic_id=payload.topic_id,
            user_id=user.uid,
            raw_text=payload.raw_text
        )
        db.add(article)
        
    await db.commit()
    await db.refresh(article)
    return article

@router.post("/articles/{article_id}/refine", response_model=ArticleResponse)
async def refine_article(
    article_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = (
        select(Article)
        .filter(Article.id == article_id, Article.user_id == user.uid)
        .options(selectinload(Article.topic))
    )
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
        
    if not article.raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot refine empty notes. Please write some raw text first!"
        )
        
    try:
        topic_title = article.topic.title if article.topic else "General Study"
        refined_data = await gemini.refine_article(
            raw_text=article.raw_text,
            topic_context=topic_title
        )
        
        article.refined_markdown = refined_data.get("refined_markdown", "")
        article.twitter_thread = refined_data.get("twitter_thread", "")
        
        await db.commit()
        await db.refresh(article)
        return article
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini refinement failed: {str(e)}"
        )

@router.get("/articles/topic/{topic_id}", response_model=ArticleResponse)
async def get_article_by_topic(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = select(Article).filter(Article.topic_id == topic_id, Article.user_id == user.uid)
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    
    if not article:
        # Return empty template so the client receives a 200 with an empty body rather than crashing
        return Article(id="", topic_id=topic_id, user_id=user.uid, raw_text="", refined_markdown="", twitter_thread="", created_at=None)
        
    return article

@router.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user)
):
    stmt = select(Article).filter(Article.id == article_id, Article.user_id == user.uid)
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article
