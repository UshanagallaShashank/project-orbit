# agents/task_agent.py — Task Extraction Agent
# ───────────────────────────────────────────────
# ONE job: extract tasks from user message + reply naturally.
#
# WHY structured output here?
#   The user might say "I need to finish the report and call my boss".
#   We want to save those as real tasks in Supabase — not just display text.
#   Structured output gives us a clean Python list. No text parsing needed.
#
# Flow:
#   message → Gemini (structured) → { reply, tasks[] }
#                                          ↓
#                                   save to tasks table

from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field
from config import settings, supabase
from prompts.task_prompt import SYSTEM_PROMPT
from utils.history import get_history, save_messages
from utils.summarize import maybe_summarize

AGENT = "task"


# ── Structured output shape ──────────────────────────────────────────────────
# Gemini must return EXACTLY this shape. If it doesn't, LangChain retries.
#
# WHY List[str] instead of list[str]?
#   Gemini's API requires the JSON schema for a list field to include an
#   "items" property (e.g. {"type": "array", "items": {"type": "string"}}).
#   Python's built-in list[str] doesn't always generate that in older
#   LangChain/Pydantic versions. typing.List[str] + Field description does.
class TaskAgentResponse(BaseModel):
    reply: str                                                          # what the user sees in the chat
    tasks: List[str] = Field(default_factory=list, description="Extracted tasks from the user message")  # saved to DB


# ── LLM + Chain ──────────────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    google_api_key=settings.GOOGLE_API_KEY,
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder("history"),
    ("human", "{input}"),
])

# Explicit tool schema workaround for langchain-google-genai bug where
# nested array item schemas can be dropped during Pydantic -> Gemini conversion.
TASK_AGENT_TOOL = {
    "name": "TaskAgentResponse",
    "description": "Extract reply and tasks from the user message.",
    "parameters": {
        "type": "object",
        "properties": {
            "reply": {
                "type": "string",
                "description": "The assistant reply to the user.",
            },
            "tasks": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Extracted tasks from the user message.",
            },
        },
        "required": ["reply"],
    },
}

chain = (
    prompt
    | llm.bind_tools([TASK_AGENT_TOOL], tool_choice=False)
    | PydanticToolsParser(tools=[TaskAgentResponse], first_tool_only=True)
)


# ── DB helpers ───────────────────────────────────────────────────────────────
def _save_tasks(user_id: str, tasks: list[str]):
    """Insert each extracted task as a row in the tasks table."""
    if not tasks:
        return
    rows = [{"user_id": user_id, "title": t, "done": False} for t in tasks]
    supabase.table("tasks").insert(rows).execute()


# ── Public API ────────────────────────────────────────────────────────────────
def run(user_id: str, message: str) -> dict:
    history, count = get_history(user_id, AGENT)
    result: TaskAgentResponse = chain.invoke({"history": history, "input": message})

    save_messages(user_id, AGENT, message, result.reply)
    _save_tasks(user_id, result.tasks)
    maybe_summarize(user_id, AGENT, count + 1, llm)

    return {"reply": result.reply, "tasks": result.tasks}
