# Route that lets the dashboard send a request to any agent through the orchestrator
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from langsmith import set_run_metadata, traceable
from pydantic import BaseModel

from orbit.core.guardrails import is_safe
from orbit.core.llm_client import (
    clear_llm_cost,
    clear_llm_cost_usd,
    clear_llm_models,
    clear_llm_usage,
    get_llm_cost,
    get_llm_cost_usd,
    get_llm_models,
    get_llm_usage,
)
from orbit.core.langgraph_orchestrator import build_orbit_graph
from orbit.types.shared import AgentName

agent_router = APIRouter()


class AgentRunRequest(BaseModel):
    agent_name: AgentName
    request: str


@traceable(project_name="v-orbit", metadata={"service": "orbit-backend", "component": "agent-route"})
def execute_agent_run(agent_name: AgentName, request: str, conversation_id: str) -> str:
    clear_llm_cost()
    clear_llm_cost_usd()
    clear_llm_models()
    clear_llm_usage()
    graph = build_orbit_graph().compile()
    state = graph.invoke({"request": request, "agent_name": agent_name, "result": ""})
    cost_in_inr = round(get_llm_cost(), 6)
    cost_usd = round(get_llm_cost_usd(), 6)
    models = get_llm_models()
    usage = get_llm_usage()
    set_run_metadata(
        agent_name=agent_name,
        request=request,
        conversation_id=conversation_id,
        cost=cost_in_inr,
        cost_usd=cost_usd,
        currency="INR",
        models=models,
        selected_model=models[-1] if models else None,
        usage_metadata=usage,
    )
    return state["result"]


@agent_router.post("/agents/run")
def run_agent(body: AgentRunRequest) -> dict[str, str]:
    if not is_safe(body.request):
        raise HTTPException(status_code=400, detail="Request blocked by guardrails")
    conversation_id = str(uuid4())
    result = execute_agent_run(
        body.agent_name,
        body.request,
        conversation_id,
    )
    return {"agent_name": body.agent_name, "result": result, "conversation_id": conversation_id}
