from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # article_id -> list of active WebSocket connections
        self._connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, article_id: int, ws: WebSocket):
        await ws.accept()
        self._connections[article_id].append(ws)

    def disconnect(self, article_id: int, ws: WebSocket):
        self._connections[article_id].remove(ws)
        if not self._connections[article_id]:
            del self._connections[article_id]

    async def send_score(self, article_id: int, score: float, explanation: str):
        payload = {"score": score, "explanation": explanation}
        dead = []
        for ws in self._connections.get(article_id, []):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections[article_id].remove(ws)


manager = ConnectionManager()
