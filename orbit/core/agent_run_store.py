# Persists agent run history and tool calls to Supabase for the dashboard to read
from datetime import datetime, timezone

from orbit.utils.db import get_db


def start_run(conversation_id: str, agent_name: str, request: str) -> int:
    row = {
        "conversation_id": conversation_id,
        "agent_name": agent_name,
        "request": request,
        "status": "running",
    }
    result = get_db().table("agent_runs").insert(row).execute()
    return int(result.data[0]["id"])


def finish_run(
    run_id: int,
    status: str,
    result: str,
    tokens_prompt: int | None,
    tokens_completion: int | None,
    tokens_total: int | None,
    cost_usd: float,
    cost_inr: float,
    model: str | None,
) -> None:
    row = {
        "status": status,
        "result": result,
        "tokens_prompt": tokens_prompt,
        "tokens_completion": tokens_completion,
        "tokens_total": tokens_total,
        "cost_usd": cost_usd,
        "cost_inr": cost_inr,
        "model": model,
        "finished_at": datetime.now(timezone.utc).isoformat(),
    }
    get_db().table("agent_runs").update(row).eq("id", run_id).execute()


def list_runs(limit: int = 50) -> list[dict[str, object]]:
    result = (
        get_db()
        .table("agent_runs")
        .select("*")
        .order("started_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [dict(row) for row in result.data]


def get_run(run_id: int) -> dict[str, object] | None:
    result = get_db().table("agent_runs").select("*").eq("id", run_id).execute()
    if not result.data:
        return None
    run = dict(result.data[0])
    run["tool_calls"] = list_tool_calls(run_id)
    return run


def list_tool_calls(run_id: int) -> list[dict[str, object]]:
    result = (
        get_db()
        .table("agent_tool_calls")
        .select("*")
        .eq("run_id", run_id)
        .order("started_at")
        .execute()
    )
    return [dict(row) for row in result.data]


def log_tool_call(
    run_id: int,
    tool_name: str,
    input_text: str,
    output_text: str,
    status: str = "success",
) -> None:
    row = {
        "run_id": run_id,
        "tool_name": tool_name,
        "input": input_text,
        "output": output_text,
        "status": status,
        "finished_at": datetime.now(timezone.utc).isoformat(),
    }
    get_db().table("agent_tool_calls").insert(row).execute()


def list_agent_edges(limit_runs: int = 200) -> list[dict[str, object]]:
    """Derives handoff edges (agent A called, then agent B called, in the same run) from
    recent tool-call history, weighted by how often each pair has occurred consecutively.
    Used by the Agent Map to highlight which paths have actually been taken."""
    recent_run_ids = [
        int(row["id"])
        for row in get_db()
        .table("agent_runs")
        .select("id")
        .order("started_at", desc=True)
        .limit(limit_runs)
        .execute()
        .data
    ]
    if not recent_run_ids:
        return []

    calls = (
        get_db()
        .table("agent_tool_calls")
        .select("run_id, tool_name, started_at")
        .in_("run_id", recent_run_ids)
        .order("started_at")
        .execute()
        .data
    )

    by_run: dict[int, list[str]] = {}
    for call in calls:
        by_run.setdefault(int(call["run_id"]), []).append(str(call["tool_name"]))

    weights: dict[tuple[str, str], int] = {}
    for sequence in by_run.values():
        for source, target in zip(sequence, sequence[1:]):
            if source == target:
                continue
            weights[(source, target)] = weights.get((source, target), 0) + 1

    return [
        {"source": source, "target": target, "weight": weight}
        for (source, target), weight in weights.items()
    ]
