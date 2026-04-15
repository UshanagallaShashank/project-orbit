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
from routes.upload_routes import router as upload_router
from routes.income_routes import router as income_router
from routes.resume_routes import router as resume_router
from contextlib import asynccontextmanager

import warnings
warnings.filterwarnings("ignore", message="Unrecognized FinishReason")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the daily digest scheduler in the background.
    # It fires at 08:00 local time and emails all users their daily summary.
    from utils.daily_digest import start_digest_scheduler
    start_digest_scheduler()
    yield


app = FastAPI(title="Project Orbit", lifespan=lifespan)

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
app.include_router(upload_router,   prefix="/api/upload",   tags=["Upload"])
app.include_router(income_router,   prefix="/api/income",   tags=["Income"])
app.include_router(resume_router,   prefix="/api/resume",   tags=["Resume"])


@app.get("/health")
def health():
    return {"status": "ok"}
