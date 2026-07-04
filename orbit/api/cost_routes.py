# Routes for CostAgent: check spend, budget, cost history
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.cost_agent.cost_agent import CostAgent

cost_router = APIRouter()


class CostRequest(BaseModel):
    query: str = "spend"


@cost_router.get("/cost/spend")
def get_spend() -> dict[str, str]:
    return {"spend": CostAgent().run("check spend")}


@cost_router.get("/cost/budget")
def get_budget() -> dict[str, str]:
    return {"budget": CostAgent().run("check budget")}


@cost_router.post("/cost/query")
def query_cost(body: CostRequest) -> dict[str, str]:
    return {"result": CostAgent().run(body.query)}
