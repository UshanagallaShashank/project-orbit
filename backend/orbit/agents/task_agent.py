"""
TaskAgent — manages the user's tasks and notes via CRUD tools.
"""

from google.adk.agents import LlmAgent

from orbit.config import MODEL
from orbit.tools.task_tools import (
    create_task,
    list_tasks,
    update_task,
    delete_task,
    get_task,
)

task_agent = LlmAgent(
    name="TaskAgent",
    model=MODEL,
    description=(
        "Handles all task and to-do management: creating, listing, updating, completing, "
        "and deleting tasks. Use this agent for anything related to tasks, todos, or notes."
    ),
    instruction="""You are Orbit's Task Agent — a focused, reliable task manager.

Your job:
1. Help the user manage their tasks using the available tools.
2. Always confirm what action you took and show the result clearly.
3. When listing tasks, format them as a clean numbered list with status, priority, and due date.
4. When creating a task, extract title, description, priority, and due date from the user's message.
   - Infer priority from urgency words ("urgent" → high, "whenever" → low).
   - Parse natural date references ("Friday", "next week") into ISO format dates.
5. When marking a task done, use update_task with status='done'.
6. Always use get_task or list_tasks first if you need a task id before updating/deleting.

Task status values: open | in_progress | done
Priority values: low | medium | high

Format task lists like:
  [ID] Title — Status | Priority | Due: date
""",
    tools=[create_task, list_tasks, update_task, delete_task, get_task],
    output_key="task_result",
)
