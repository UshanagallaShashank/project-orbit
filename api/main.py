"""
WHAT: FastAPI entry — the only file Cloud Run runs.
      Handles HTTP signaling for WebRTC. Audio itself flows over UDP after handshake.

WHY:  Thin layer. No business logic here. Three concerns only:
        /health     → Cloud Run keepalive
        /chat       → quick text test (no Live API needed)
        /ice-servers → STUN config for browser WebRTC
        /offer      → SDP handshake (one-time per session)

LIBS: fastapi       — web framework, async request handling
      uvicorn       — ASGI server (run: uvicorn api.main:app --reload)
      python-dotenv — loads .env in local dev (Cloud Run uses env vars directly)
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.adk.runners import InMemoryRunner

from agents.orchestrator import root_agent
from api.webrtc import close_all, handle_offer

load_dotenv()

app = FastAPI(title="Orbit")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared runner — one per server process. InMemoryRunner is fine for single Cloud Run instance.
# When scaling to multiple instances, swap to a DatabaseSessionService backed by Supabase.
_runner = InMemoryRunner(agent=root_agent, app_name="orbit")


@app.on_event("shutdown")
async def _shutdown():
    await close_all()


@app.get("/health")
async def health():
    # Cloud Run checks this endpoint to confirm the container started successfully
    return {"status": "ok"}


@app.get("/chat")
async def chat(q: str = "Say hello in one sentence"):
    # Text-only test — works without Live API. Good for confirming the API key is active.
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    r = client.models.generate_content(model="gemini-2.5-flash", contents=q)
    return {"reply": r.text}


@app.get("/ice-servers")
async def ice_servers():
    # Browser fetches this before creating RTCPeerConnection.
    # Google's STUN servers are free and handle NAT traversal for most networks.
    # Only add TURN if users report connection failures behind strict corporate firewalls.
    return {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]}


@app.post("/offer")
async def offer(params: dict):
    # Browser sends SDP offer (contains ICE candidates + codec preferences).
    # We return SDP answer. After this one HTTP call, audio flows over UDP only.
    session = await _runner.session_service.create_session(app_name="orbit", user_id="default")
    return await handle_offer(params["sdp"], params["type"], _runner, session)
