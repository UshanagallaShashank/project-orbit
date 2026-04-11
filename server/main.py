# main.py - The Entry Point
# --------------------------
# ONE job: create the FastAPI app, attach middleware, register routes.
# This is the file uvicorn runs. Everything starts here.
#
# Request flow:
#   Browser -> CORS check -> route handler -> response

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.tasks_routes import router as tasks_router
from routes.tracker_routes import router as tracker_router
from routes.memories_routes import router as memories_router

app = FastAPI(title="Project Orbit")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(chat_router,     prefix="/api/chat",     tags=["Chat"])
app.include_router(tasks_router,    prefix="/api/tasks",    tags=["Tasks"])
app.include_router(tracker_router,  prefix="/api/tracker",  tags=["Tracker"])
app.include_router(memories_router, prefix="/api/memories", tags=["Memories"])


@app.get("/health")
def health():
    return {"status": "ok"}
