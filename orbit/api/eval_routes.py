# Routes for EvalAgent: score agent outputs
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.eval_agent.eval_agent import EvalAgent

eval_router = APIRouter()


class EvalRequest(BaseModel):
    output: str


@eval_router.post("/eval")
def eval_output(body: EvalRequest) -> dict[str, str]:
    return {"score": EvalAgent().run(body.output)}
