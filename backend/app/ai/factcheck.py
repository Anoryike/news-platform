import httpx
from app.config import settings


async def analyze(text: str) -> float:
    if not settings.google_factcheck_api_key:
        return 50.0
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                "https://factchecktools.googleapis.com/v1alpha1/claims:search",
                params={"key": settings.google_factcheck_api_key, "query": text[:200], "pageSize": 5},
            )
            resp.raise_for_status()
            claims = resp.json().get("claims", [])
            if not claims:
                return 50.0
            false_count, total = 0, 0
            for claim in claims:
                for review in claim.get("claimReview", []):
                    rating = review.get("textualRating", "").lower()
                    total += 1
                    if any(w in rating for w in ["false", "fake", "incorrect", "misleading", "pants on fire"]):
                        false_count += 1
            return round(((total - false_count) / total) * 100, 2) if total else 50.0
    except Exception:
        return 50.0
