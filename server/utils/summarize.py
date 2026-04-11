# utils/summarize.py — compress history when it exceeds the threshold
# ─────────────────────────────────────────────────────────────────────
# Only triggers when message count >= SUMMARY_THRESHOLD.
# Runs in a background thread so the user never waits for it.
# A lock per user+agent prevents two threads from summarizing at the same time.

import json
import threading
from config import supabase
from utils.history import SUMMARY_THRESHOLD

# One lock per user+agent — prevents race condition when messages arrive fast
_locks: dict[str, threading.Lock] = {}
_locks_mutex = threading.Lock()


def _get_lock(user_id: str, agent: str) -> threading.Lock:
    key = f"{user_id}:{agent}"
    with _locks_mutex:
        if key not in _locks:
            _locks[key] = threading.Lock()
        return _locks[key]


def _run(user_id: str, agent: str, llm):
    lock = _get_lock(user_id, agent)
    if not lock.acquire(blocking=False):   # already summarizing → skip
        return
    try:
        res = (
            supabase.table("messages")
            .select("id, role, content")
            .eq("user_id", user_id)
            .eq("agent", agent)
            .order("created_at", desc=False)
            .execute()
        )
        all_rows         = res.data
        all_exchanges    = [m for m in all_rows if m["role"] == "exchange"]
        existing_summary = next((m["content"] for m in all_rows if m["role"] == "summary"), None)

        if not all_exchanges:
            return

        # Build readable transcript from all exchanges
        lines = []
        for m in all_exchanges:
            pair = json.loads(m["content"])
            lines.append(f"USER: {pair['user']}")
            lines.append(f"ASSISTANT: {pair['assistant']}")
        transcript = "\n".join(lines)

        # Include previous summary so the new one builds on top of it
        if existing_summary:
            prompt = (
                f"You have an existing summary of a past conversation:\n{existing_summary}\n\n"
                f"New exchanges to add to the summary:\n{transcript}\n\n"
                f"Update the summary with the new information. "
                f"Keep it as bullet points. Include: name, goals, preferences, decisions, key facts."
            )
        else:
            prompt = (
                f"Summarize this conversation as bullet points. "
                f"Include: name, goals, preferences, decisions, key facts.\n\n{transcript}"
            )

        result  = llm.invoke(prompt)
        summary = f"[PAST CONVERSATION SUMMARY]\n{result.content}"

        # Delete ALL exchanges + old summary → replace with only the summary
        supabase.table("messages").delete() \
            .eq("user_id", user_id).eq("agent", agent) \
            .eq("role", "exchange").execute()

        supabase.table("messages").delete() \
            .eq("user_id", user_id).eq("agent", agent) \
            .eq("role", "summary").execute()

        supabase.table("messages").insert({
            "user_id": user_id, "agent": agent,
            "role": "summary", "content": summary,
        }).execute()

    finally:
        lock.release()   # always release even if something crashes


def maybe_summarize(user_id: str, agent: str, count: int, llm):
    if count >= SUMMARY_THRESHOLD:
        threading.Thread(target=_run, args=(user_id, agent, llm), daemon=True).start()
