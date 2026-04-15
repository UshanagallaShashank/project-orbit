# agents/agent_factory.py - Shared building blocks for every agent
# -----------------------------------------------------------------
# Every agent does the same 4 things:
#   1. Create an LLM
#   2. Build a prompt (system + history + human)
#   3. Build a chain (prompt -> LLM -> structured output parser)
#   4. Run the loop (get_history -> invoke -> save -> summarize -> return)
#
# This file owns those 4 things PLUS shared utilities:
#   make_tool_schema()     -> builds Gemini tool schema (reply always included)
#   save_list_to_table()   -> generic list-of-strings DB insert (task/tracker/memory)
#   run_plain_agent()      -> plain text reply loop (mentor, general chat)
#   fetch_user_context()   -> pulls recent tasks/entries/memories -> injected into prompts
#                            so agents can give replies that reference the user's history
#
# Each agent file only owns what's UNIQUE:
#   - its response model (Pydantic shape)
#   - its tool schema (via make_tool_schema)
#   - its DB save call (via save_list_to_table)

from typing import Callable, Optional, Type
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel
from config import settings, supabase
from utils.history import get_history, save_messages
from utils.summarize import maybe_summarize


# -- 1. LLM -------------------------------------------------------------------

def make_llm(model: str = "gemini-2.5-flash-lite") -> ChatGoogleGenerativeAI:
    """
    Create a Gemini LLM instance.
      "gemini-2.5-flash-lite"  -> fast + cheap (Task, Tracker, Memory, Comms, Job, Resume, Mock)
      "gemini-2.5-flash"       -> better reasoning (Mentor)
    """
    return ChatGoogleGenerativeAI(model=model, google_api_key=settings.GOOGLE_API_KEY)


# -- 2. Prompt -----------------------------------------------------------------

def make_prompt(system_prompt: str) -> ChatPromptTemplate:
    """
    Build the standard 3-part prompt every agent uses:
      [system]   -> who this agent is + its rules
      [history]  -> last N messages from Supabase (gives the AI memory)
      [human]    -> the current user message
    """
    return ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder("history"),
        ("human", "{input}"),
    ])


# -- 3. Tool schema builder ----------------------------------------------------

def make_tool_schema(name: str, description: str, extra_properties: Optional[dict] = None) -> dict:
    """
    Build the JSON schema Gemini receives for structured output.

    WHY this helper exists:
      Every structured agent has a "reply" field - it's always the same shape.
      Only the extra fields differ per agent (tasks, entries, memories, etc.).
      This avoids copy-pasting the boilerplate reply property every time.

    WHY write schema manually instead of auto-generating from Pydantic?
      Gemini requires array fields to have "items". LangChain's auto-conversion
      sometimes drops that key. Writing it manually guarantees correctness.

    Usage:
      make_tool_schema("TaskAgentResponse", "Extract tasks", {
          "tasks": {"type": "array", "items": {"type": "string"}, "description": "..."}
      })
    """
    properties: dict = {
        "reply": {
            "type": "string",
            "description": "The assistant reply shown to the user.",
        }
    }
    if extra_properties:
        properties.update(extra_properties)

    return {
        "name": name,
        "description": description,
        "parameters": {
            "type": "object",
            "properties": properties,
            "required": ["reply"],
        },
    }


# -- 4. Chain (structured output) ---------------------------------------------

def make_chain(
    prompt: ChatPromptTemplate,
    llm: ChatGoogleGenerativeAI,
    response_model: Type[BaseModel],
    tool_schema: dict,
):
    """
    Build a chain that returns a structured Pydantic object instead of plain text.
    Uses bind_tools + PydanticToolsParser to guarantee Gemini sees the correct schema.
    """
    return (
        prompt
        | llm.bind_tools([tool_schema], tool_choice=False)
        | PydanticToolsParser(tools=[response_model], first_tool_only=True)
    )


# -- 5. DB helper - list insert ------------------------------------------------

def save_list_to_table(
    user_id: str,
    items: list[str],
    table: str,
    content_field: str = "content",
    extra_fields: Optional[dict] = None,
) -> None:
    """
    Insert a list of strings into a Supabase table.

    WHY extracted here:
      Task, Tracker, and Memory agents all do the same thing:
      take a list of strings -> insert one row per string with user_id.
      The only differences are the table name, the column name, and any
      extra fields (e.g. tasks needs done=False).

    Usage:
      save_list_to_table(user_id, result.tasks,   "tasks",          content_field="title", extra_fields={"done": False})
      save_list_to_table(user_id, result.entries, "tracker_entries")
      save_list_to_table(user_id, result.memories,"memories")
    """
    if not items:
        return
    rows = [{content_field: item, "user_id": user_id, **(extra_fields or {})} for item in items]
    supabase.table(table).insert(rows).execute()


# -- 6. Run loop - structured output agents ------------------------------------

def run_agent(
    user_id: str,
    agent_name: str,
    message: str,
    chain,
    llm: ChatGoogleGenerativeAI,
    on_result: Optional[Callable] = None,
) -> dict:
    """
    Standard run loop for agents with structured output (Task, Tracker, Memory).

    Steps:
      1. get_history   -> fetch last N messages from Supabase
      2. chain.invoke  -> Gemini returns structured Pydantic object
      3. save_messages -> persist the exchange
      4. on_result     -> agent-specific DB save callback: fn(user_id, result)
      5. maybe_summarize -> compress history if > 10 messages
      6. return result.model_dump() -> { reply, <agent fields> }
    """
    history, count = get_history(user_id, agent_name)
    result: BaseModel = chain.invoke({"history": history, "input": message})

    save_messages(user_id, agent_name, message, result.reply)

    if on_result:
        on_result(user_id, result)

    maybe_summarize(user_id, agent_name, count + 1, llm)
    return result.model_dump()


# -- 7. User context fetcher ---------------------------------------------------

def fetch_user_context(user_id: str) -> str:
    """
    Pull the user's recent data from Supabase and format it as a readable
    context block to inject into agent prompts.

    WHY this matters:
      Without this, the agent replies are transactional: "Got it, logged!"
      With this, the agent can say: "That's your 4th DP session this week.
      Trees is set for tomorrow - you haven't touched it in 9 days."
      The reply becomes personal because the agent actually knows the user.

    Returns a formatted string, empty string if all tables are empty.
    """
    sections = []

    # Pending tasks (undone)
    tasks_res = (
        supabase.table("tasks")
        .select("title, created_at")
        .eq("user_id", user_id)
        .eq("done", False)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )
    if tasks_res.data:
        titles = [r["title"] for r in tasks_res.data]
        sections.append("Open tasks:\n" + "\n".join(f"- {t}" for t in titles))

    # Recent tracker entries
    tracker_res = (
        supabase.table("tracker_entries")
        .select("content, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(7)
        .execute()
    )
    if tracker_res.data:
        entries = [r["content"] for r in tracker_res.data]
        sections.append("Recent progress:\n" + "\n".join(f"- {e}" for e in entries))

    # All saved memories - split into resume profile and general facts
    memory_res = (
        supabase.table("memories")
        .select("content")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )
    if memory_res.data:
        all_memories = [r["content"] for r in memory_res.data]
        resume_facts  = [m for m in all_memories if m.startswith("[RESUME]")]
        general_facts = [m for m in all_memories if not m.startswith("[RESUME]")]

        if resume_facts:
            # Strip the [RESUME] tag so the prompt reads cleanly
            clean = [m[len("[RESUME] "):] for m in resume_facts]
            sections.append("Resume profile:\n" + "\n".join(f"- {f}" for f in clean))

        if general_facts:
            sections.append("What I know about you:\n" + "\n".join(f"- {f}" for f in general_facts))

    if not sections:
        return ""

    return "=== User Context ===\n" + "\n\n".join(sections) + "\n==================="


# -- 8. Run loop - plain text agents ------------------------------------------

def run_plain_agent(
    user_id: str,
    agent_name: str,
    message: str,
    chain,
    llm: ChatGoogleGenerativeAI,
) -> dict:
    """
    Run loop for agents that return plain text - no structured output.
    Used by: MentorAgent, OrchestratorAgent general chat fallback.

    Same steps as run_agent but chain returns a message object, not a Pydantic model.
    """
    history, count = get_history(user_id, agent_name)
    reply: str = chain.invoke({"history": history, "input": message}).content

    save_messages(user_id, agent_name, message, reply)
    maybe_summarize(user_id, agent_name, count + 1, llm)
    return {"reply": reply}
