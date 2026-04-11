# utils/summarize.py — compress history when it exceeds the threshold
# ─────────────────────────────────────────────────────────────────────
# Only triggers when message count >= SUMMARY_THRESHOLD.
# Runs in a background thread so the user never waits for it.

from concurrent.futures import ThreadPoolExecutor
from config import supabase
from utils.history import SUMMARY_THRESHOLD


def _run(user_id: str, agent: str, llm):
    res = (
        supabase.table("messages")
        .select("role, content")
        .eq("user_id", user_id)
        .eq("agent", agent)
        .neq("role", "summary")
        .order("created_at", desc=False)
        .execute()
    )
    transcript = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in res.data)
    result = llm.invoke(
        f"Summarize this conversation in bullet points. Capture names, facts, tasks, preferences:\n\n{transcript}"
    )
    summary = f"[PAST CONVERSATION SUMMARY]\n{result.content}"

    supabase.table("messages").delete() \
        .eq("user_id", user_id) \
        .eq("agent", agent) \
        .neq("role", "summary") \
        .execute()

    supabase.table("messages").insert({
        "user_id": user_id, "agent": agent,
        "role": "summary", "content": summary,
    }).execute()


def maybe_summarize(user_id: str, agent: str, count: int, llm):
    if count >= SUMMARY_THRESHOLD:
        with ThreadPoolExecutor(max_workers=1) as ex:
            ex.submit(_run, user_id, agent, llm)
