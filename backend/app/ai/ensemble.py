import asyncio
from app.ai import bert, claimbuster, factcheck

WEIGHTS = {"bert": 0.6, "claimbuster": 0.2, "factcheck": 0.2}


async def analyze_article(title: str, body: str) -> dict:
    text = f"{title}\n\n{body}"
    bert_score, cb_score, fc_score = await asyncio.gather(
        bert.classify(text),
        claimbuster.analyze(text),
        factcheck.analyze(text),
    )
    score = round(
        bert_score * WEIGHTS["bert"] + cb_score * WEIGHTS["claimbuster"] + fc_score * WEIGHTS["factcheck"], 2
    )
    if score >= 75:
        verdict = "Стаття виглядає достовірною"
    elif score >= 50:
        verdict = "Стаття потребує додаткової перевірки"
    else:
        verdict = "Стаття містить ознаки недостовірної інформації"

    return {
        "score": score,
        "bert_score": bert_score,
        "claimbuster_score": cb_score,
        "factcheck_score": fc_score,
        "explanation": (
            f"{verdict}. BERT: {bert_score:.0f}/100, "
            f"ClaimBuster: {cb_score:.0f}/100, "
            f"FactCheck: {fc_score:.0f}/100."
        ),
    }
