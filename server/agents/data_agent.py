# agents/data_agent.py - Unified data extraction agent
# -------------------------------------------------------
# Replaces task_agent, tracker_agent, memory_agent.
#
# WHY one agent instead of three?
#   A single message can span all three data types:
#   "I solved 3 DP problems (tracker) and need to review trees tomorrow (task)"
#   Three separate agents would either drop one or require 3 LLM calls.
#   One agent with 3 tools handles it in a single call.
#
# WHY context injection?
#   Without it: "Got it, logged!" - transactional, forgettable.
#   With it: "4th DP session this week. Trees task added - you haven't
#   touched it in 9 days." - personal, actually useful.
#
# Flow:
#   fetch_user_context()   -> pulls recent tasks/entries/memories from DB
#   build_prompt(context)  -> injects context into system prompt
#   chain.invoke()         -> 1 LLM call -> { reply, tasks[], entries[], memories[] }
#   save all 3 lists       -> 0-3 DB writes depending on what was extracted

from typing import List
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_factory import (
    make_llm, make_chain, make_tool_schema,
    save_list_to_table, run_plain_agent, fetch_user_context,
)
from prompts.data_prompt import build_prompt
from utils.history import get_history, save_messages
from utils.summarize import maybe_summarize
from config import supabase

AGENT = "data"


# -- Single response model covering all 3 data types --------------------------
class DataAgentResponse(BaseModel):
    reply:            str
    tasks:            List[str] = Field(default_factory=list, description="Tasks or todos to create")
    completed_tasks:  List[str] = Field(default_factory=list, description="Task titles the user says they finished or completed")
    entries:          List[str] = Field(default_factory=list, description="Progress entries the user logged")
    memories:         List[str] = Field(default_factory=list, description="Facts to remember about the user")


# -- Tool schema - 4 array fields, all need explicit items --------------------
TOOL_SCHEMA = make_tool_schema(
    name="DataAgentResponse",
    description="Extract reply, tasks, completed tasks, progress entries, and memories from the user message.",
    extra_properties={
        "tasks": {
            "type": "array",
            "items": {"type": "string"},
            "description": "New tasks or todos to create.",
        },
        "completed_tasks": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Task titles the user says they finished, completed, or are done with.",
        },
        "entries": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Progress entries the user logged today.",
        },
        "memories": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Facts to remember about the user.",
        },
    },
)


# -- Task completion helper ----------------------------------------------------
def _mark_tasks_done(user_id: str, completed_titles: list[str]) -> int:
    """
    For each title in completed_titles, find the best-matching open task
    and mark it done=True. Uses case-insensitive partial match.
    Returns the number of tasks actually marked done.
    """
    if not completed_titles:
        return 0

    # Fetch all open tasks for this user
    res = (
        supabase.table("tasks")
        .select("id, title")
        .eq("user_id", user_id)
        .eq("done", False)
        .execute()
    )
    open_tasks = res.data or []
    if not open_tasks:
        return 0

    marked = 0
    for target in completed_titles:
        # Find the best match: prefer exact (case-insensitive), then partial
        target_lower = target.lower().strip()
        best_id = None

        # Try exact match first
        for t in open_tasks:
            if t["title"].lower().strip() == target_lower:
                best_id = t["id"]
                break

        # Fall back to: every word in the target appears in the task title
        if not best_id:
            target_words = [w for w in target_lower.split() if len(w) > 2]
            for t in open_tasks:
                title_lower = t["title"].lower()
                if target_words and all(w in title_lower for w in target_words):
                    best_id = t["id"]
                    break

        # Fall back to: any word match
        if not best_id:
            for t in open_tasks:
                title_lower = t["title"].lower()
                if any(w in title_lower for w in target_lower.split() if len(w) > 2):
                    best_id = t["id"]
                    break

        if best_id:
            supabase.table("tasks").update({"done": True}).eq("id", best_id).execute()
            # Remove from open_tasks so it can't be matched twice
            open_tasks = [t for t in open_tasks if t["id"] != best_id]
            marked += 1

    return marked

llm = make_llm()


# -- Public API ----------------------------------------------------------------
def run(user_id: str, message: str) -> dict:
    # 1. Fetch live context BEFORE building the prompt
    #    This is what makes replies feel personal - the LLM sees the user's history
    context = fetch_user_context(user_id)

    # 2. Build a context-aware prompt for this specific user + this specific call
    system_prompt = build_prompt(context)
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder("history"),
        ("human", "{input}"),
    ])
    chain = make_chain(prompt, llm, DataAgentResponse, TOOL_SCHEMA)

    # 3. Run: history -> invoke -> save exchange
    history, count = get_history(user_id, AGENT)
    result: DataAgentResponse | None = chain.invoke({"history": history, "input": message})

    if result is None:
        # If the model did not return structured tool output, fall back to a plain reply
        # so the app does not crash and the user still gets a response.
        return run_plain_agent(user_id, AGENT, message, prompt | llm, llm)

    save_messages(user_id, AGENT, message, result.reply)

    # 4. Mark completed tasks done BEFORE creating new ones (avoids re-matching)
    _mark_tasks_done(user_id, result.completed_tasks)

    # 5. Save whichever lists are non-empty (0–3 DB writes)
    save_list_to_table(user_id, result.tasks,    "tasks",           content_field="title", extra_fields={"done": False})
    save_list_to_table(user_id, result.entries,  "tracker_entries")
    save_list_to_table(user_id, result.memories, "memories")

    maybe_summarize(user_id, AGENT, count + 1, llm)

    return {
        "reply":           result.reply,
        "tasks":           result.tasks,
        "completed_tasks": result.completed_tasks,
        "entries":         result.entries,
        "memories":        result.memories,
    }
