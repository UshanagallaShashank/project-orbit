# Full CRUD plus search for resume versions in the Supabase resume_versions table
from orbit.utils.db import get_db


def save_version(label: str, content: str, note: str) -> dict[str, object]:
    row = {"label": label, "content": content, "note": note}
    result = get_db().table("resume_versions").insert(row).execute()
    return dict(result.data[0])


def list_versions(limit: int = 100) -> list[dict[str, object]]:
    result = (
        get_db()
        .table("resume_versions")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [dict(row) for row in result.data]


def update_version(version_id: int, label: str, content: str, note: str) -> dict[str, object]:
    row = {"label": label, "content": content, "note": note}
    result = get_db().table("resume_versions").update(row).eq("id", version_id).execute()
    return dict(result.data[0])


def delete_version(version_id: int) -> None:
    get_db().table("resume_versions").delete().eq("id", version_id).execute()


def search_versions(q: str = "") -> list[dict[str, object]]:
    query = get_db().table("resume_versions").select("*")
    if q:
        query = query.ilike("label", f"%{q}%")
    result = query.order("created_at", desc=True).execute()
    return [dict(row) for row in result.data]
