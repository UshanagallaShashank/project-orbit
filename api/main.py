"""
WHAT: FastAPI entry point — the only file Cloud Run actually runs.
WHY:  Thin HTTP layer. Owns routing + CORS. Nothing else.
      All streaming logic lives in stream.py, all logging in logger.py.
LIBS: fastapi — web framework
      uvicorn — ASGI server (start with: uvicorn api.main:app --reload)
      python-dotenv — loads .env file in local dev
"""

import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api.stream import handle_session

load_dotenv()

app = FastAPI(title="Orbit")

# Firebase frontend origin in prod, * in local dev — lock this down before launch
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    # Cloud Run hits this to confirm the container started correctly
    return {"status": "ok"}

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    # One WebSocket connection = one conversation session
    # Browser sends audio bytes or JSON text, we stream back transcript + audio
    await ws.accept()
    try:
        await handle_session(ws)
    except WebSocketDisconnect:
        pass  # user closed tab or lost connection — normal, not an error
