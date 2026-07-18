# Route that lets the dashboard send a request to any agent through the orchestrator
import asyncio
import json
from collections.abc import AsyncIterator
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langsmith import set_run_metadata, traceable
from pydantic import BaseModel

from orbit.core.agent_run_store import finish_run, get_run, list_agent_edges, list_runs, log_tool_call, start_run
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
    run_id = start_run(conversation_id, agent_name, request)

    def on_step(step_agent_name: AgentName, note: str, result: str) -> None:
        log_tool_call(run_id, step_agent_name.value, note, result)

    try:
        graph = build_orbit_graph().compile()
        state = graph.invoke(
            {
                "request": request,
                "agent_name": agent_name,
                "result": "",
                "run_id": run_id,
                "on_step": on_step,
            }
        )
    except Exception:
        finish_run(run_id, "error", "", None, None, None, get_llm_cost_usd(), get_llm_cost(), None)
        raise
    cost_in_inr = round(get_llm_cost(), 6)
    cost_usd = round(get_llm_cost_usd(), 6)
    models = get_llm_models()
    usage = get_llm_usage()
    finish_run(
        run_id,
        "success",
        state["result"],
        int(usage["input_tokens"]) or None,
        int(usage["output_tokens"]) or None,
        int(usage["total_tokens"]) or None,
        cost_usd,
        cost_in_inr,
        models[-1] if models else None,
    )
    set_run_metadata(
        agent_name=agent_name,
        request=request,
        conversation_id=conversation_id,
        run_id=run_id,
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


@agent_router.get("/agents/runs")
def get_runs(limit: int = 50) -> list[dict[str, object]]:
    return list_runs(limit=limit)


@agent_router.get("/agents/runs/{run_id}")
def get_run_detail(run_id: int) -> dict[str, object]:
    run = get_run(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@agent_router.get("/agents/edges")
def get_agent_edges() -> list[dict[str, object]]:
    return list_agent_edges()


async def _stream_runs() -> AsyncIterator[str]:
    seen: dict[int, str] = {}
    while True:
        runs = list_runs(limit=20)
        for run in runs:
            run_id = int(str(run["id"]))
            fingerprint = f"{run['status']}:{run.get('finished_at')}"
            if seen.get(run_id) != fingerprint:
                seen[run_id] = fingerprint
                yield f"data: {json.dumps(run, default=str)}\n\n"
        await asyncio.sleep(1)


@agent_router.get("/agents/stream")
def stream_agent_runs() -> StreamingResponse:
    return StreamingResponse(_stream_runs(), media_type="text/event-stream")
