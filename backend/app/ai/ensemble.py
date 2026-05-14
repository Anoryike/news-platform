import asyncio
from app.ai import bert, claimbuster, factcheck
from app.config import settings


async def analyze_article(title: str, body: str) -> dict:
    text = f"{title}\n\n{body}"
    bert_score, cb_score, fc_score = await asyncio.gather(
        bert.classify(text),
        claimbuster.analyze(text),
        factcheck.analyze(text),
    )

    has_cb = bool(settings.claimbuster_api_key)
    has_fc = bool(settings.google_factcheck_api_key)

    if has_cb and has_fc:
        score = bert_score * 0.6 + cb_score * 0.2 + fc_score * 0.2
    elif has_fc:
        score = bert_score * 0.8 + fc_score * 0.2
    elif has_cb:
        score = bert_score * 0.8 + cb_score * 0.2
    else:
        score = bert_score

    score = round(score, 2)

    # Detect non-political content where the model is less reliable
    entertainment_keywords = [
        "game", "games", "gaming", "trailer", "dlc", "playstation", "xbox", "nintendo",
        "movie", "film", "series", "episode", "season", "streaming", "spotify", "music",
        "album", "sport", "match", "tournament", "score", "goal",
    ]
    text_lower = text.lower()
    is_entertainment = any(kw in text_lower for kw in entertainment_keywords)

    if score >= 75:
        verdict = "Стаття виглядає достовірною"
    elif score >= 50:
        verdict = "Стаття потребує додаткової перевірки"
    else:
        verdict = "Стаття містить ознаки недостовірної інформації"

    if is_entertainment:
        verdict += " (модель оптимізована для новин, не для розважального контенту)"

    parts = [f"BERT: {bert_score:.0f}/100"]
    if has_cb:
        parts.append(f"ClaimBuster: {cb_score:.0f}/100")
    if has_fc:
        parts.append(f"FactCheck: {fc_score:.0f}/100")

    return {
        "score": score,
        "bert_score": bert_score,
        "claimbuster_score": cb_score if has_cb else None,
        "factcheck_score": fc_score if has_fc else None,
        "explanation": f"{verdict}. {', '.join(parts)}.",
    }
