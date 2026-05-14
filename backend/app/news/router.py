from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User
from app.news import service
from app.articles import service as articles_service

router = APIRouter(prefix="/news", tags=["news"])

CATEGORIES = ["general", "technology", "science", "health", "business", "entertainment", "sports"]


@router.post("/import")
async def import_news(
    background_tasks: BackgroundTasks,
    category: str = "general",
    country: str = "us",
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {CATEGORIES}")

    count = await service.import_news(db, category=category, country=country)

    if count > 0:
        imported_articles = await _get_pending_without_score(db)
        for article in imported_articles:
            background_tasks.add_task(
                articles_service.run_ai_analysis, article.id, article.title, article.body
            )

    return {"imported": count, "message": f"Імпортовано {count} нових статей, AI аналіз запущено"}


async def _get_pending_without_score(db: AsyncSession):
    from sqlalchemy import select
    from app.models import Article, ArticleStatus, AiScore
    result = await db.execute(
        select(Article)
        .outerjoin(AiScore, Article.id == AiScore.article_id)
        .where(Article.status == ArticleStatus.PENDING)
        .where(AiScore.id == None)
        .limit(50)
    )
    return result.scalars().all()
