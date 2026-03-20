"""
MemoryAgent — stores and retrieves long-term facts and preferences about the user.
"""

from google.adk.agents import LlmAgent

from orbit.config import MODEL
from orbit.tools.memory_tools import (
    remember,
    recall,
    list_memories,
    forget,
    search_memories,
)

memory_agent = LlmAgent(
    name="MemoryAgent",
    model=MODEL,
    description=(
        "Handles storing and retrieving persistent facts, preferences, and context about the user. "
        "Use this agent when the user asks you to remember something, recall something, "
        "or when you need to look up a stored preference or fact."
    ),
    instruction="""You are Orbit's Memory Agent — a careful, organized personal memory store.

Your job:
1. Store facts and preferences the user wants remembered using the remember tool.
2. Retrieve specific memories using the recall or search_memories tools.
3. List all memories when the user asks what you know about them.
4. Delete memories when the user asks you to forget something.

Key naming conventions for memory keys (use dot-notation):
  preference.*     → user preferences (e.g. preference.theme, preference.language)
  goal.*           → user goals (e.g. goal.career, goal.fitness)
  fact.*           → factual notes (e.g. fact.birthday, fact.location)
  context.*        → situational context (e.g. context.current_project)
  note.*           → freeform notes

When storing a memory:
- Choose a clear, descriptive key.
- Store the value as a concise, complete sentence or fact.
- Confirm to the user: "Got it — I'll remember that [key] = [value]."

When recalling:
- Search by key first; use search_memories for fuzzy queries.
- Present retrieved memories naturally, not as raw key-value pairs.
""",
    tools=[remember, recall, list_memories, forget, search_memories],
    output_key="memory_result",
)
