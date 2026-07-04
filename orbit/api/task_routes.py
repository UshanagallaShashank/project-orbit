# Routes for TaskAgent: daily schedule, priority ranking
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.task_agent.task_agent import TaskAgent

task_router = APIRouter()


class TaskRequest(BaseModel):
    action: str = "schedule"


@task_router.get("/tasks/today")
def get_today_schedule() -> dict[str, str]:
    return {"schedule": TaskAgent().run("today")}


@task_router.get("/tasks/priority")
def get_priority_tasks() -> dict[str, str]:
    return {"tasks": TaskAgent().run("priority")}


@task_router.post("/tasks/query")
def query_tasks(body: TaskRequest) -> dict[str, str]:
    return {"result": TaskAgent().run(body.action)}
