# agents/task_agent.py - Task Extraction Agent
# -----------------------------------------------
# UNIQUE to this agent:
#   - TaskAgentResponse  (reply + tasks list)
#   - TOOL_SCHEMA        (built via make_tool_schema)
#   - _save_tasks()      (built via save_list_to_table)

from typing import List
from pydantic import BaseModel, Field
from prompts.task_prompt import SYSTEM_PROMPT
from agents.agent_factory import (
    make_llm, make_prompt, make_chain, make_tool_schema,
    save_list_to_table, run_agent,
)

AGENT = "task"


# -- What Gemini must return ---------------------------------------------------
class TaskAgentResponse(BaseModel):
    reply: str
    tasks: List[str] = Field(default_factory=list, description="Extracted tasks from the user message")


# -- Tool schema ---------------------------------------------------------------
TOOL_SCHEMA = make_tool_schema(
    name="TaskAgentResponse",
    description="Extract a reply and any tasks the user mentioned.",
    extra_properties={
        "tasks": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Extracted tasks from the user message.",
        }
    },
)


# -- Build via factory ---------------------------------------------------------
llm    = make_llm()
prompt = make_prompt(SYSTEM_PROMPT)
chain  = make_chain(prompt, llm, TaskAgentResponse, TOOL_SCHEMA)


# -- DB save -------------------------------------------------------------------
def _save_tasks(user_id: str, result: TaskAgentResponse):
    save_list_to_table(
        user_id, result.tasks,
        table="tasks", content_field="title", extra_fields={"done": False},
    )


# -- Public API ----------------------------------------------------------------
def run(user_id: str, message: str) -> dict:
    return run_agent(user_id, AGENT, message, chain, llm, on_result=_save_tasks)
