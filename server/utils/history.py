# utils/history.py — fetch and save conversation history
# ─────────────────────────────────────────────────────────
# Saves each exchange (user + AI) as ONE row with JSON content:
#   { "user": "hello", "assistant": "Hi there!" }
#
# Why 1 row instead of 2?
#   Simpler inserts, half the rows, and an exchange always stays together.

import json
from langchain_core.messages import HumanMessage, AIMessage
from config import supabase

SUMMARY_THRESHOLD = 10


def get_history(user_id: str, agent: str) -> tuple[list, int]:
    res = (
        supabase.table("messages")
        .select("role, content")
        .eq("user_id", user_id)
        .eq("agent", agent)
        .order("created_at", desc=False)
        .execute()
    )
    all_rows     = res.data
    exchanges    = [m for m in all_rows if m["role"] == "exchange"]
    summary_rows = [m for m in all_rows if m["role"] == "summary"]

    history = []

    if summary_rows:
        history.append(AIMessage(content=summary_rows[-1]["content"]))

    # Each exchange row holds both sides — unpack into 2 LangChain messages
    for row in exchanges[-SUMMARY_THRESHOLD:]:
        pair = json.loads(row["content"])
        history.append(HumanMessage(content=pair["user"]))
        history.append(AIMessage(content=pair["assistant"]))

    return history, len(exchanges)


def save_messages(user_id: str, agent: str, message: str, reply: str):
    supabase.table("messages").insert({
        "user_id": user_id,
        "agent":   agent,
        "role":    "exchange",
        "content": json.dumps({"user": message, "assistant": reply}),
    }).execute()
