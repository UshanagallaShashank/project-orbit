# Route that lets the dashboard send a request to any agent through the orchestrator
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from orbit.core.guardrails import is_safe
from orbit.core.langgraph_orchestrator import build_orbit_graph
from orbit.types.shared import AgentName

agent_router = APIRouter()


class AgentRunRequest(BaseModel):
    agent_name: AgentName
    request: str


@agent_router.post("/agents/run")
def run_agent(body: AgentRunRequest) -> dict[str, str]:
    if not is_safe(body.request):
        raise HTTPException(status_code=400, detail="Request blocked by guardrails")
    graph = build_orbit_graph().compile()
    state = graph.invoke({"request": body.request, "agent_name": body.agent_name, "result": ""})
    return {"agent_name": body.agent_name, "result": state["result"]}
