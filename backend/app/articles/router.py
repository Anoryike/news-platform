from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User
from app.articles.schemas import ArticleCreate, ArticleOut, ArticlesPage, AiScoreOut
from app.articles import service

router = APIRouter(prefix="/articles", tags=["articles"])


def _serialize(article) -> ArticleOut:
    ai = AiScoreOut.from_orm_obj(article.ai_score) if article.ai_score else None
    return ArticleOut(
        id=article.id,
        title=article.title,
        body=article.body,
        status=article.status.value,
        createdAt=article.created_at,
        author=article.author,
        aiScore=ai,
    )


@router.get("", response_model=ArticlesPage)
async def list_articles(page: int = 1, limit: int = 20, db: AsyncSession = Depends(get_db)):
    articles, total = await service.get_articles(page, limit, db)
    return ArticlesPage(data=[_serialize(a) for a in articles], total=total)


@router.post("", response_model=ArticleOut, status_code=201)
async def create_article(
    body: ArticleCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = await service.create_article(body.title, body.body, current_user, db)
    background_tasks.add_task(service.run_ai_analysis, article.id, article.title, article.body)
    return _serialize(article)


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    article = await service.get_article(article_id, db)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return _serialize(article)
