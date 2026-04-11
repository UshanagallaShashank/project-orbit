# agents/tracker_agent.py - Progress Tracker Agent
# --------------------------------------------------
# UNIQUE to this agent:
#   - TrackerAgentResponse  (reply + entries list)
#   - TOOL_SCHEMA           (built via make_tool_schema)
#   - _save_entries()       (built via save_list_to_table -> tracker_entries table)

from typing import List
from pydantic import BaseModel, Field
from prompts.tracker_prompt import SYSTEM_PROMPT
from agents.agent_factory import (
    make_llm, make_prompt, make_chain, make_tool_schema,
    save_list_to_table, run_agent,
)

AGENT = "tracker"


class TrackerAgentResponse(BaseModel):
    reply: str
    entries: List[str] = Field(default_factory=list, description="Progress entries logged by the user")


TOOL_SCHEMA = make_tool_schema(
    name="TrackerAgentResponse",
    description="Extract a reply and any progress entries the user logged.",
    extra_properties={
        "entries": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Progress entries logged by the user.",
        }
    },
)

llm    = make_llm()
prompt = make_prompt(SYSTEM_PROMPT)
chain  = make_chain(prompt, llm, TrackerAgentResponse, TOOL_SCHEMA)


def _save_entries(user_id: str, result: TrackerAgentResponse):
    save_list_to_table(user_id, result.entries, table="tracker_entries")


def run(user_id: str, message: str) -> dict:
    return run_agent(user_id, AGENT, message, chain, llm, on_result=_save_entries)
