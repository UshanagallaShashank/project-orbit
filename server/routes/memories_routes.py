# routes/memories_routes.py - Memory CRUD endpoints
# ----------------------------------------------------
# GET    /api/memories        -> list all memories for the logged-in user
# DELETE /api/memories/{id}  -> delete a memory

from fastapi import APIRouter, HTTPException, Depends
from middleware import get_current_user
from config import supabase

router = APIRouter()


@router.get("")
def list_memories(user=Depends(get_current_user)):
    """Return all saved memories for the logged-in user, newest first."""
    res = (
        supabase.table("memories")
        .select("id, content, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.delete("/{memory_id}")
def delete_memory(memory_id: str, user=Depends(get_current_user)):
    """Delete a memory. Only the owner can delete their memories."""
    res = (
        supabase.table("memories")
        .delete()
        .eq("id", memory_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"deleted": True}
