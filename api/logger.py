"""
WHAT: Writes one row to Supabase token_logs after every ADK event that has usage data.
WHY:  Dashboard needs this table to show you token costs and call history.
      Keeping it here means stream.py stays clean — it just calls log_turn() and moves on.
LIBS: supabase  — official Python client, wraps the Supabase REST API
      os        — reads env vars (SUPABASE_URL, SUPABASE_SERVICE_KEY)
"""

import os
from supabase import create_client

# Lazy init — client is created on first call, not at import time.
# Reason: load_dotenv() in main.py runs AFTER imports, so os.getenv() returns
# None at module load time even if .env has the values.
_sb = None

def _client():
    global _sb
    if _sb is None:
        _sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    return _sb

async def log_turn(session_id: str, event, agent: str = "orchestrator"):
    """
    Called by stream.py once per ADK event that has usage_metadata.
    Supabase REST insert is fast enough to not block the stream —
    but if latency ever becomes a problem, move this to a background task.
    """
    meta = event.usage_metadata
    _client().table("token_logs").insert({
        "session_id":    session_id,
        "agent":         agent,
        "model":         "gemini-2.5-flash",             # update when model changes
        "input_tokens":  getattr(meta, "prompt_token_count",     0),
        "output_tokens": getattr(meta, "candidates_token_count", 0),
        "latency_ms":    getattr(meta, "total_token_count",      0),  # swap for real latency later
    }).execute()

async def save_recording(session_id: str, audio_bytes: bytes) -> str:
    """
    Uploads a raw audio blob to Supabase Storage bucket 'recordings'.
    Returns the public URL so the dashboard can play it back.
    """
    path = f"{session_id}.wav"
    _client().storage.from_("recordings").upload(path, audio_bytes, {"content-type": "audio/wav"})
    return _client().storage.from_("recordings").get_public_url(path)
