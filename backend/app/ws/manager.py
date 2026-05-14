from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._article: dict[int, list[WebSocket]] = defaultdict(list)
        self._feed: list[WebSocket] = []

    async def connect(self, article_id: int, ws: WebSocket):
        await ws.accept()
        self._article[article_id].append(ws)

    async def connect_feed(self, ws: WebSocket):
        await ws.accept()
        self._feed.append(ws)

    def disconnect(self, article_id: int, ws: WebSocket):
        self._article[article_id].remove(ws)
        if not self._article[article_id]:
            del self._article[article_id]

    def disconnect_feed(self, ws: WebSocket):
        if ws in self._feed:
            self._feed.remove(ws)

    async def send_score(self, article_id: int, score: float, explanation: str):
        payload = {"articleId": article_id, "score": score, "explanation": explanation}

        for collection, key in [(self._article.get(article_id, []), None), (self._feed, None)]:
            dead = []
            for ws in list(collection):
                try:
                    await ws.send_json(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                try:
                    collection.remove(ws)
                except ValueError:
                    pass


manager = ConnectionManager()
