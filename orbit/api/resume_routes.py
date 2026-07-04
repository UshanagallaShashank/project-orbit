# Routes for full resume version CRUD, search, and diffing two versions
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from orbit.agents.resume_agent.resume_diff import diff_versions
from orbit.agents.resume_agent.resume_store import (
    delete_version,
    list_versions,
    save_version,
    search_versions,
    update_version,
)

resume_router = APIRouter()


class ResumeVersion(BaseModel):
    label: str
    content: str
    note: str = ""


@resume_router.post("/resume/versions")
def add_version(body: ResumeVersion) -> dict[str, object]:
    return save_version(body.label, body.content, body.note)


@resume_router.get("/resume/versions")
def get_versions() -> list[dict[str, object]]:
    return list_versions()


@resume_router.get("/resume/versions/search")
def search(q: str = "") -> list[dict[str, object]]:
    return search_versions(q)


@resume_router.get("/resume/versions/diff")
def diff(old_id: int, new_id: int) -> dict[str, list[str]]:
    versions = {row["id"]: row for row in list_versions()}
    old_content = str(versions[old_id]["content"])
    new_content = str(versions[new_id]["content"])
    return {"diff": diff_versions(old_content, new_content)}


@resume_router.put("/resume/versions/{version_id}")
def edit_version(version_id: int, body: ResumeVersion) -> dict[str, object]:
    try:
        return update_version(version_id, body.label, body.content, body.note)
    except IndexError as error:
        raise HTTPException(status_code=404, detail="Version not found") from error


@resume_router.delete("/resume/versions/{version_id}")
def remove_version(version_id: int) -> dict[str, bool]:
    delete_version(version_id)
    return {"deleted": True}
