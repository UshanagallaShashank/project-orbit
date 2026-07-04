# Full CRUD plus search for memory rows in the Supabase memories table
from orbit.utils.db import get_db


def save_memory(content: str, tag: str) -> dict[str, object]:
    row = {"content": content, "tag": tag}
    result = get_db().table("memories").insert(row).execute()
    return dict(result.data[0])


def list_memories(limit: int = 200) -> list[dict[str, object]]:
    result = (
        get_db().table("memories").select("*").order("created_at", desc=True).limit(limit).execute()
    )
    return [dict(row) for row in result.data]


def update_memory(memory_id: int, content: str, tag: str) -> dict[str, object]:
    row = {"content": content, "tag": tag}
    result = get_db().table("memories").update(row).eq("id", memory_id).execute()
    return dict(result.data[0])


def delete_memory(memory_id: int) -> None:
    get_db().table("memories").delete().eq("id", memory_id).execute()


def search_memories(q: str = "", tag: str = "") -> list[dict[str, object]]:
    query = get_db().table("memories").select("*")
    if q:
        query = query.ilike("content", f"%{q}%")
    if tag:
        query = query.eq("tag", tag)
    result = query.order("created_at", desc=True).execute()
    return [dict(row) for row in result.data]
