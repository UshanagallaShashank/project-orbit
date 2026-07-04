# Routes for SandboxAgent: test features in isolation
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.sandbox_agent.sandbox_agent import SandboxAgent

sandbox_router = APIRouter()


class SandboxRequest(BaseModel):
    branch: str


@sandbox_router.post("/sandbox/test")
def test_feature(body: SandboxRequest) -> dict[str, str]:
    return {"results": SandboxAgent().run(body.branch)}
