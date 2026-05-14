import certifi
import httpx
from app.config import settings


async def analyze(text: str) -> float:
    if not settings.claimbuster_api_key:
        return 50.0
    try:
        async with httpx.AsyncClient(timeout=15.0, verify=False) as client:
            resp = await client.post(
                "https://idir.uta.edu/claimbuster/api/v2/score/text/",
                json={"input_text": text[:3000]},
                headers={"x-api-key": settings.claimbuster_api_key},
            )
            resp.raise_for_status()
            scores = [r["score"] for r in resp.json().get("results", [])]
            if not scores:
                return 50.0
            return round((1 - sum(scores) / len(scores)) * 100, 2)
    except Exception:
        return 50.0
