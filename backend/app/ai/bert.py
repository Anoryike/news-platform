import asyncio
from functools import lru_cache
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch


@lru_cache(maxsize=1)
def _load_pipeline():
    model_name = "GonzaloA/fake-news-bert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    return pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        device=0 if torch.cuda.is_available() else -1,
        truncation=True,
        max_length=512,
    )


async def classify(text: str) -> float:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_inference, text)


def _run_inference(text: str) -> float:
    clf = _load_pipeline()
    output = clf(text[:512])[0]
    label, confidence = output["label"], output["score"]
    # LABEL_1=real → high score, LABEL_0=fake → low score
    return round(confidence * 100 if label == "LABEL_1" else (1 - confidence) * 100, 2)
