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

import langchain_google_genai.chat_models as genai_chat_models

app = FastAPI(title="Project Orbit")

# Patch langchain_google_genai for finish_reason values that may be ints instead of enums.
# Some Gemini response candidates may return an integer finish_reason, while the library
# expects an object with a `.name` attribute. This wrapper prevents a crash on such values.

_original_response_to_result = genai_chat_models._response_to_result

class _FinishReasonFallback:
    def __init__(self, value):
        self._value = value

    @property
    def name(self):
        return str(self._value)


def _patched_response_to_result(response, stream: bool = False):
    for candidate in getattr(response, "candidates", []):
        fr = getattr(candidate, "finish_reason", None)
        if fr is not None and not hasattr(fr, "name"):
            candidate.finish_reason = _FinishReasonFallback(fr)
    return _original_response_to_result(response, stream=stream)

genai_chat_models._response_to_result = _patched_response_to_result

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


@app.get("/health")
def health():
    return {"status": "ok"}
