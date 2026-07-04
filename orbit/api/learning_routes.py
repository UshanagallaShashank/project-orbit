# Routes for full learning entry CRUD and search
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from orbit.agents.learning_tracker.learning_store import (
    delete_entry,
    list_entries,
    save_entry,
    search_entries,
    update_entry,
)

learning_router = APIRouter()


class LearningEntry(BaseModel):
    track: str
    topic: str
    status: str = "not_started"
    note: str = ""


@learning_router.post("/learning")
def add_entry(body: LearningEntry) -> dict[str, object]:
    return save_entry(body.track, body.topic, body.status, body.note)


@learning_router.get("/learning")
def get_entries() -> list[dict[str, object]]:
    return list_entries()


@learning_router.get("/learning/search")
def search(q: str = "", track: str = "", status: str = "") -> list[dict[str, object]]:
    return search_entries(q, track, status)


@learning_router.put("/learning/{entry_id}")
def edit_entry(entry_id: int, body: LearningEntry) -> dict[str, object]:
    try:
        return update_entry(entry_id, body.track, body.topic, body.status, body.note)
    except IndexError as error:
        raise HTTPException(status_code=404, detail="Entry not found") from error


@learning_router.delete("/learning/{entry_id}")
def remove_entry(entry_id: int) -> dict[str, bool]:
    delete_entry(entry_id)
    return {"deleted": True}
