# agents/memory_agent.py - Memory Agent
# --------------------------------------
# UNIQUE to this agent:
#   - MemoryAgentResponse  (reply + memories list)
#   - TOOL_SCHEMA          (built via make_tool_schema)
#   - _save_memories()     (built via save_list_to_table -> memories table)
#
# Future: memories will also go into pgvector for semantic search.
# For now: plain Postgres row per memory fact.

from typing import List
from pydantic import BaseModel, Field
from prompts.memory_prompt import SYSTEM_PROMPT
from agents.agent_factory import (
    make_llm, make_prompt, make_chain, make_tool_schema,
    save_list_to_table, run_agent,
)

AGENT = "memory"


class MemoryAgentResponse(BaseModel):
    reply: str
    memories: List[str] = Field(default_factory=list, description="Facts to remember about the user")


TOOL_SCHEMA = make_tool_schema(
    name="MemoryAgentResponse",
    description="Extract a reply and any facts the user wants remembered.",
    extra_properties={
        "memories": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Facts to remember about the user.",
        }
    },
)

llm    = make_llm()
prompt = make_prompt(SYSTEM_PROMPT)
chain  = make_chain(prompt, llm, MemoryAgentResponse, TOOL_SCHEMA)


def _save_memories(user_id: str, result: MemoryAgentResponse):
    save_list_to_table(user_id, result.memories, table="memories")


def run(user_id: str, message: str) -> dict:
    return run_agent(user_id, AGENT, message, chain, llm, on_result=_save_memories)
