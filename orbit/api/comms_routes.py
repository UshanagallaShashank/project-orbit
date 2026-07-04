# Routes for CommsAgent: draft emails (never auto-sends)
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.comms_agent.comms_agent import CommsAgent

comms_router = APIRouter()


class CommsRequest(BaseModel):
    context: str


@comms_router.post("/comms/draft-email")
def draft_email(body: CommsRequest) -> dict[str, str]:
    return {"draft": CommsAgent().run(body.context)}
