# Routes for JobAgent: search, approval queue
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.job_agent.job_agent import JobAgent

job_router = APIRouter()


class JobRequest(BaseModel):
    query: str = "search"


@job_router.get("/jobs/search")
def search_jobs() -> dict[str, str]:
    return {"jobs": JobAgent().run("search")}


@job_router.get("/jobs/queue")
def approval_queue() -> dict[str, str]:
    return {"queue": JobAgent().run("queue")}
