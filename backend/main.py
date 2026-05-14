import truststore
truststore.inject_into_ssl()

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.auth.router import router as auth_router
from app.articles.router import router as articles_router
from app.news.router import router as news_router
from app.ws.manager import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="NewsVerify API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(news_router)


@app.websocket("/ws/feed")
async def websocket_feed(websocket: WebSocket):
    await manager.connect_feed(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_feed(websocket)


@app.websocket("/ws/{article_id}")
async def websocket_endpoint(websocket: WebSocket, article_id: int):
    await manager.connect(article_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(article_id, websocket)


@app.get("/health")
async def health():
    return {"status": "ok"}
