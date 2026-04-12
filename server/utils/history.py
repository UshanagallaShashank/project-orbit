# utils/history.py - fetch and save conversation history
# ---------------------------------------------------------
# ALL agents share a single "chat" history bucket per user.
# This means every agent sees the full conversation — when the user
# says "i did" after a job agent reply, any agent can understand the context.
#
# Previously each agent had its own silo (agent="job", agent="memory", etc.)
# which caused "I don't have a record of your previous question" errors.

import json
from langchain_core.messages import HumanMessage, AIMessage
from config import supabase

SUMMARY_THRESHOLD = 10
SHARED_AGENT = "chat"  # single bucket for all agents


def get_history(user_id: str, agent: str = SHARED_AGENT) -> tuple[list, int]:
    res = (
        supabase.table("messages")
        .select("role, content")
        .eq("user_id", user_id)
        .eq("agent", SHARED_AGENT)
        .order("created_at", desc=False)
        .execute()
    )
    all_rows     = res.data
    exchanges    = [m for m in all_rows if m["role"] == "exchange"]
    summary_rows = [m for m in all_rows if m["role"] == "summary"]

    history = []

    if summary_rows:
        history.append(AIMessage(content=summary_rows[-1]["content"]))

    for row in exchanges[-SUMMARY_THRESHOLD:]:
        pair = json.loads(row["content"])
        history.append(HumanMessage(content=pair["user"]))
        history.append(AIMessage(content=pair["assistant"]))

    return history, len(exchanges)


def save_messages(user_id: str, agent: str, message: str, reply: str):
    supabase.table("messages").insert({
        "user_id": user_id,
        "agent":   SHARED_AGENT,  # always write to shared bucket
        "role":    "exchange",
        "content": json.dumps({"user": message, "assistant": reply}),
    }).execute()
