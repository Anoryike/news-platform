import ssl
import certifi
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models import Article, ArticleStatus, User

NEWS_API_URL = "https://newsapi.org/v2/top-headlines"


async def get_or_create_newsbot(db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.email == "newsbot@system"))
    user = result.scalar_one_or_none()
    if not user:
        import bcrypt
        hashed = bcrypt.hashpw(b"__newsbot__", bcrypt.gensalt()).decode()
        user = User(email="newsbot@system", password=hashed)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


_ssl_ctx = ssl.create_default_context(cafile=certifi.where())


async def fetch_news(category: str = "general", country: str = "us", page_size: int = 20) -> list[dict]:
    if not settings.news_api_key:
        return []
    async with httpx.AsyncClient(timeout=15.0, verify=False) as client:
        resp = await client.get(
            NEWS_API_URL,
            params={
                "apiKey": settings.news_api_key,
                "category": category,
                "country": country,
                "pageSize": page_size,
            },
        )
        resp.raise_for_status()
        return resp.json().get("articles", [])


async def import_news(db: AsyncSession, category: str = "general", country: str = "us") -> int:
    articles_data = await fetch_news(category=category, country=country)
    if not articles_data:
        return 0

    newsbot = await get_or_create_newsbot(db)
    imported = 0

    for item in articles_data:
        title = (item.get("title") or "").strip()
        source_url = item.get("url") or ""

        # NewsAPI free tier truncates `content` to ~200 chars + "[+XXXX chars]"
        # Use description as body (cleaner) and append truncated content if different
        description = (item.get("description") or "").strip()
        content = (item.get("content") or "").strip()
        import re
        content_clean = re.sub(r"\s*\[\+\d+ chars\]$", "", content).strip()
        if content_clean and content_clean not in description:
            body = f"{description}\n\n{content_clean}" if description else content_clean
        else:
            body = description

        if not title or not body or title == "[Removed]":
            continue

        existing = await db.execute(select(Article).where(Article.source_url == source_url))
        if existing.scalar_one_or_none():
            continue

        article = Article(
            title=title,
            body=body,
            image_url=item.get("urlToImage"),
            source_url=source_url,
            author_id=newsbot.id,
            status=ArticleStatus.PENDING,
        )
        db.add(article)
        await db.flush()
        imported += 1

    await db.commit()
    return imported
