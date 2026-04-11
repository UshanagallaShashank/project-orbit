# routes/tracker_routes.py - Tracker CRUD endpoints
# ----------------------------------------------------
# GET  /api/tracker        -> list all entries for the logged-in user
# DELETE /api/tracker/{id} -> delete an entry

from fastapi import APIRouter, HTTPException, Depends
from middleware import get_current_user
from config import supabase

router = APIRouter()


@router.get("")
def list_entries(user=Depends(get_current_user)):
    """Return all tracker entries for the logged-in user, newest first."""
    res = (
        supabase.table("tracker_entries")
        .select("id, content, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.delete("/{entry_id}")
def delete_entry(entry_id: str, user=Depends(get_current_user)):
    """Delete a tracker entry. Only the owner can delete their entries."""
    res = (
        supabase.table("tracker_entries")
        .delete()
        .eq("id", entry_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"deleted": True}
