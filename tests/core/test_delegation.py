import json

from orbit.core import delegation
from orbit.types.shared import AgentName


class _StubAgent:
    def __init__(self, response: str):
        self.response = response
        self.calls: list[str] = []

    def run(self, request: str) -> str:
        self.calls.append(request)
        return self.response


def test_run_delegated_calls_one_agent_then_finishes(monkeypatch):
    expense_stub = _StubAgent("Logged 250 INR under food")
    monkeypatch.setitem(delegation.AGENT_TOOLS, AgentName.EXPENSE, ("logs expenses", expense_stub))

    responses = iter([
        json.dumps({"action": "call", "agent": "expense", "note": "log 250 on food"}),
        json.dumps({"action": "finish", "answer": "Logged your food expense."}),
    ])
    monkeypatch.setattr(delegation, "invoke_prompt", lambda model, prompt: next(responses))

    result = delegation.run_delegated("spent 250 on food")

    assert result == "Logged your food expense."
    assert expense_stub.calls == ["log 250 on food"]


def test_run_delegated_chains_two_agents(monkeypatch):
    expense_stub = _StubAgent("Logged 250 INR under food")
    cost_stub = _StubAgent("Session spend: 250 INR")
    monkeypatch.setitem(delegation.AGENT_TOOLS, AgentName.EXPENSE, ("logs expenses", expense_stub))
    monkeypatch.setitem(delegation.AGENT_TOOLS, AgentName.COST, ("tracks spend", cost_stub))

    responses = iter([
        json.dumps({"action": "call", "agent": "expense", "note": "log 250 on food"}),
        json.dumps({"action": "call", "agent": "cost", "note": "check my budget after that"}),
        json.dumps({"action": "finish", "answer": "Logged the expense and you're within budget."}),
    ])
    monkeypatch.setattr(delegation, "invoke_prompt", lambda model, prompt: next(responses))

    result = delegation.run_delegated("spent 250 on food, am I over budget?")

    assert result == "Logged the expense and you're within budget."
    assert expense_stub.calls == ["log 250 on food"]
    assert cost_stub.calls == ["check my budget after that"]


def test_run_delegated_stops_on_unparseable_response(monkeypatch):
    monkeypatch.setattr(delegation, "invoke_prompt", lambda model, prompt: "not json at all")

    result = delegation.run_delegated("do something")

    assert result == "Could not determine which agent should handle this request."


def test_run_delegated_stops_on_repeat_call(monkeypatch):
    memory_stub = _StubAgent("saved")
    monkeypatch.setitem(delegation.AGENT_TOOLS, AgentName.MEMORY, ("stores notes", memory_stub))

    same_call = json.dumps({"action": "call", "agent": "memory", "note": "same note"})
    monkeypatch.setattr(delegation, "invoke_prompt", lambda model, prompt: same_call)

    result = delegation.run_delegated("remember this")

    assert memory_stub.calls == ["same note"]
    assert "memory: saved" in result


def test_run_delegated_invokes_on_step_callback(monkeypatch):
    expense_stub = _StubAgent("Logged 250 INR under food")
    monkeypatch.setitem(delegation.AGENT_TOOLS, AgentName.EXPENSE, ("logs expenses", expense_stub))

    responses = iter([
        json.dumps({"action": "call", "agent": "expense", "note": "log 250 on food"}),
        json.dumps({"action": "finish", "answer": "done"}),
    ])
    monkeypatch.setattr(delegation, "invoke_prompt", lambda model, prompt: next(responses))

    steps: list[tuple[AgentName, str, str]] = []
    delegation.run_delegated("spent 250 on food", on_step=lambda name, note, result: steps.append((name, note, result)))

    assert steps == [(AgentName.EXPENSE, "log 250 on food", "Logged 250 INR under food")]
