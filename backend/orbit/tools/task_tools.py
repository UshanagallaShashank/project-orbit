"""
Task tools — CRUD operations on tasks stored in a local JSON file.
Each task has: id, title, description, status, priority, due_date, created_at, updated_at.
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Literal

from orbit.config import TASKS_FILE


# ── helpers ──────────────────────────────────────────────────────────────────

def _load() -> list[dict]:
    if not TASKS_FILE.exists():
        return []
    return json.loads(TASKS_FILE.read_text(encoding="utf-8"))


def _save(tasks: list[dict]) -> None:
    TASKS_FILE.write_text(json.dumps(tasks, indent=2, ensure_ascii=False), encoding="utf-8")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── tools ─────────────────────────────────────────────────────────────────────

def create_task(
    title: str,
    description: str = "",
    priority: Literal["low", "medium", "high"] = "medium",
    due_date: str = "",
) -> dict:
    """Create a new task and save it.

    Args:
        title: Short title of the task.
        description: Optional longer description or notes.
        priority: Task priority — 'low', 'medium', or 'high'. Defaults to 'medium'.
        due_date: Optional due date in ISO format (e.g. '2025-04-01' or '2025-04-01T15:00:00').

    Returns:
        dict: The created task object with its assigned id, or an error dict.
    """
    tasks = _load()
    task = {
        "id": str(uuid.uuid4())[:8],
        "title": title,
        "description": description,
        "status": "open",
        "priority": priority,
        "due_date": due_date,
        "created_at": _now(),
        "updated_at": _now(),
    }
    tasks.append(task)
    _save(tasks)
    return {"status": "success", "task": task}


def list_tasks(
    status_filter: Literal["open", "in_progress", "done", "all"] = "all",
    priority_filter: Literal["low", "medium", "high", "all"] = "all",
) -> dict:
    """List tasks, optionally filtered by status or priority.

    Args:
        status_filter: Filter by task status. Use 'all' to return everything.
        priority_filter: Filter by priority. Use 'all' to return everything.

    Returns:
        dict: A dict with 'tasks' list and 'count' integer.
    """
    tasks = _load()
    if status_filter != "all":
        tasks = [t for t in tasks if t.get("status") == status_filter]
    if priority_filter != "all":
        tasks = [t for t in tasks if t.get("priority") == priority_filter]
    return {"status": "success", "tasks": tasks, "count": len(tasks)}


def update_task(
    task_id: str,
    title: str = "",
    description: str = "",
    status: Literal["open", "in_progress", "done", ""] = "",
    priority: Literal["low", "medium", "high", ""] = "",
    due_date: str = "",
) -> dict:
    """Update fields on an existing task. Only provided (non-empty) fields are changed.

    Args:
        task_id: The id of the task to update.
        title: New title (leave empty to keep current).
        description: New description (leave empty to keep current).
        status: New status — 'open', 'in_progress', or 'done' (leave empty to keep current).
        priority: New priority — 'low', 'medium', or 'high' (leave empty to keep current).
        due_date: New due date in ISO format (leave empty to keep current).

    Returns:
        dict: The updated task or an error dict if the id was not found.
    """
    tasks = _load()
    for task in tasks:
        if task["id"] == task_id:
            if title:
                task["title"] = title
            if description:
                task["description"] = description
            if status:
                task["status"] = status
            if priority:
                task["priority"] = priority
            if due_date:
                task["due_date"] = due_date
            task["updated_at"] = _now()
            _save(tasks)
            return {"status": "success", "task": task}
    return {"status": "error", "error_message": f"Task with id '{task_id}' not found."}


def delete_task(task_id: str) -> dict:
    """Permanently delete a task by its id.

    Args:
        task_id: The id of the task to delete.

    Returns:
        dict: Success confirmation or error if id not found.
    """
    tasks = _load()
    original_count = len(tasks)
    tasks = [t for t in tasks if t["id"] != task_id]
    if len(tasks) == original_count:
        return {"status": "error", "error_message": f"Task with id '{task_id}' not found."}
    _save(tasks)
    return {"status": "success", "message": f"Task '{task_id}' deleted."}


def get_task(task_id: str) -> dict:
    """Get a single task by its id.

    Args:
        task_id: The id of the task to retrieve.

    Returns:
        dict: The task object or an error dict if not found.
    """
    tasks = _load()
    for task in tasks:
        if task["id"] == task_id:
            return {"status": "success", "task": task}
    return {"status": "error", "error_message": f"Task with id '{task_id}' not found."}
