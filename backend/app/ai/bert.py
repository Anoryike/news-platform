import asyncio
import os
import warnings
from functools import lru_cache

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
warnings.filterwarnings("ignore", category=UserWarning)

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Temperature > 1 softens the distribution so we get scores in the middle range
# instead of always 0 or 100. Value 3.0 maps extreme logits to ~70/30 range.
_TEMPERATURE = 6.0


@lru_cache(maxsize=1)
def _load_model():
    from app.config import settings
    tokenizer = AutoTokenizer.from_pretrained(settings.bert_model_name)
    model = AutoModelForSequenceClassification.from_pretrained(settings.bert_model_name)
    model.eval()
    return tokenizer, model


async def classify(text: str) -> float:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_inference, text)


def _run_inference(text: str) -> float:
    tokenizer, model = _load_model()
    inputs = tokenizer(text[:512], return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits / _TEMPERATURE, dim=-1)[0]

    # Find index of the "real/true" label
    real_idx = None
    for idx, label in model.config.id2label.items():
        if label.upper() in ("TRUE", "REAL", "LABEL_1"):
            real_idx = idx
            break

    if real_idx is not None:
        return round(probs[real_idx].item() * 100, 2)
    # fallback: last label = positive class
    return round(probs[-1].item() * 100, 2)
