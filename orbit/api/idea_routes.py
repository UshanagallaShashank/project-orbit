# Routes for IdeaAgent: brainstorm ideas
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.idea_agent.idea_agent import IdeaAgent

idea_router = APIRouter()


class IdeaRequest(BaseModel):
    problem: str


@idea_router.post("/ideas/brainstorm")
def brainstorm(body: IdeaRequest) -> dict[str, str]:
    return {"ideas": IdeaAgent().run(body.problem)}
