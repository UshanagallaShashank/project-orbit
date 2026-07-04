# Full CRUD plus search for learning entries in the Supabase learning_entries table
from orbit.utils.db import get_db


def save_entry(track: str, topic: str, status: str, note: str) -> dict[str, object]:
    row = {"track": track, "topic": topic, "status": status, "note": note}
    result = get_db().table("learning_entries").insert(row).execute()
    return dict(result.data[0])


def list_entries(limit: int = 200) -> list[dict[str, object]]:
    result = (
        get_db()
        .table("learning_entries")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [dict(row) for row in result.data]


def update_entry(entry_id: int, track: str, topic: str, status: str, note: str) -> dict[str, object]:
    row = {"track": track, "topic": topic, "status": status, "note": note}
    result = get_db().table("learning_entries").update(row).eq("id", entry_id).execute()
    return dict(result.data[0])


def delete_entry(entry_id: int) -> None:
    get_db().table("learning_entries").delete().eq("id", entry_id).execute()


def search_entries(q: str = "", track: str = "", status: str = "") -> list[dict[str, object]]:
    query = get_db().table("learning_entries").select("*")
    if q:
        query = query.ilike("topic", f"%{q}%")
    if track:
        query = query.eq("track", track)
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).execute()
    return [dict(row) for row in result.data]
