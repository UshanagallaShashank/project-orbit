# main.py — The Entry Point
# ──────────────────────────
# ONE job: create the FastAPI app, attach middleware, register routes.
# This is the file uvicorn runs. Everything starts here.
#
# Request flow:
#   Browser → CORS check → route handler → response
#
# WHY CORS?
#   Browsers block requests from different ports by default.
#   React runs on :5173, backend on :8000 → browser blocks it.
#   CORSMiddleware tells the browser "it's okay, allow :5173".

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.tasks_routes import router as tasks_router

app = FastAPI(title="Project Orbit")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes — prefix is added to every route inside that file
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(tasks_router, prefix="/api/tasks", tags=["Tasks"])


@app.get("/health")
def health():
    return {"status": "ok"}
