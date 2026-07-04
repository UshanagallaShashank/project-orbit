# Routes for ProjectTracker: list repos, detect stale projects
from fastapi import APIRouter

from orbit.agents.project_tracker.project_tracker import ProjectTracker

project_tracker_router = APIRouter()


@project_tracker_router.get("/projects/list")
def list_projects() -> dict[str, str]:
    return {"projects": ProjectTracker().run("list")}


@project_tracker_router.get("/projects/stale")
def list_stale() -> dict[str, str]:
    return {"stale": ProjectTracker().run("stale")}
