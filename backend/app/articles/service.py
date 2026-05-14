from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import selectinload
from app.models import Article, AiScore, ArticleStatus, User
from app.ai.ensemble import analyze_article
from app.ws.manager import manager


async def get_articles(page: int, limit: int, db: AsyncSession):
    offset = (page - 1) * limit
    result = await db.execute(
        select(Article)
        .options(selectinload(Article.author), selectinload(Article.ai_score))
        .order_by(Article.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    articles = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(Article))
    total = total_result.scalar_one()
    return articles, total


async def get_article(article_id: int, db: AsyncSession) -> Article | None:
    result = await db.execute(
        select(Article)
        .options(selectinload(Article.author), selectinload(Article.ai_score))
        .where(Article.id == article_id)
    )
    return result.scalar_one_or_none()


async def create_article(title: str, body: str, author: User, db: AsyncSession) -> Article:
    article = Article(title=title, body=body, author_id=author.id)
    db.add(article)
    await db.commit()
    await db.refresh(article)
    # reload with relationships
    result = await db.execute(
        select(Article)
        .options(selectinload(Article.author), selectinload(Article.ai_score))
        .where(Article.id == article.id)
    )
    return result.scalar_one()


async def run_ai_analysis(article_id: int, title: str, body: str):
    """Background task — runs AI, saves score, pushes WebSocket update."""
    from app.database import AsyncSessionLocal
    try:
        result = await analyze_article(title, body)
        async with AsyncSessionLocal() as db:
            score = AiScore(
                article_id=article_id,
                score=result["score"],
                bert_score=result["bert_score"],
                claimbuster_score=result["claimbuster_score"],
                factcheck_score=result["factcheck_score"],
                explanation=result["explanation"],
            )
            db.add(score)
            await db.execute(
                update(Article)
                .where(Article.id == article_id)
                .values(status=ArticleStatus.ANALYZED)
            )
            await db.commit()
        await manager.send_score(article_id, result["score"], result["explanation"])
    except Exception as e:
        print(f"[AI] analysis failed for article {article_id}: {e}")


async def reset_and_reanalyze_all(db: AsyncSession, background_tasks: BackgroundTasks) -> int:
    await db.execute(delete(AiScore))
    await db.execute(update(Article).values(status=ArticleStatus.PENDING))
    await db.commit()

    result = await db.execute(select(Article))
    articles = result.scalars().all()
    for article in articles:
        background_tasks.add_task(run_ai_analysis, article.id, article.title, article.body)
    return len(articles)
