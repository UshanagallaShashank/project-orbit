# Routes for full memory CRUD and search
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from orbit.agents.memory_agent.memory_store import (
    delete_memory,
    list_memories,
    save_memory,
    search_memories,
    update_memory,
)

memory_router = APIRouter()


class MemoryEntry(BaseModel):
    content: str
    tag: str = "general"


@memory_router.post("/memories")
def add_memory(body: MemoryEntry) -> dict[str, object]:
    return save_memory(body.content, body.tag)


@memory_router.get("/memories")
def get_memories() -> list[dict[str, object]]:
    return list_memories()


@memory_router.get("/memories/search")
def search(q: str = "", tag: str = "") -> list[dict[str, object]]:
    return search_memories(q, tag)


@memory_router.put("/memories/{memory_id}")
def edit_memory(memory_id: int, body: MemoryEntry) -> dict[str, object]:
    try:
        return update_memory(memory_id, body.content, body.tag)
    except IndexError as error:
        raise HTTPException(status_code=404, detail="Memory not found") from error


@memory_router.delete("/memories/{memory_id}")
def remove_memory(memory_id: int) -> dict[str, bool]:
    delete_memory(memory_id)
    return {"deleted": True}
