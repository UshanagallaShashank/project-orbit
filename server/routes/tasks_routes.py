# routes/tasks_routes.py - Task CRUD endpoints
# ----------------------------------------------
# Endpoints:
#   GET  /api/tasks        -> list all tasks for the logged-in user
#   PATCH /api/tasks/{id}  -> mark a task done/undone

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middleware import get_current_user
from config import supabase

router = APIRouter()


@router.get("")
def list_tasks(user=Depends(get_current_user)):
    """Return all tasks for the logged-in user, newest first."""
    res = (
        supabase.table("tasks")
        .select("id, title, done, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


class TaskUpdate(BaseModel):
    done: bool


@router.patch("/{task_id}")
def update_task(task_id: str, body: TaskUpdate, user=Depends(get_current_user)):
    """Toggle a task's done status. Only the owner can update their tasks."""
    res = (
        supabase.table("tasks")
        .update({"done": body.done})
        .eq("id", task_id)
        .eq("user_id", user["id"])   # RLS reinforced at app layer too
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return res.data[0]
