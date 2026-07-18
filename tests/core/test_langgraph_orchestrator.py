from orbit.core import langgraph_orchestrator
from orbit.types.shared import AgentName


def test_choose_agent_uses_llm_response(monkeypatch):
    monkeypatch.setattr(langgraph_orchestrator, "invoke_prompt", lambda model, prompt: "expense")
    assert langgraph_orchestrator.choose_agent("Please log this purchase") == AgentName.EXPENSE


def test_route_to_agent_auto_always_delegates(monkeypatch):
    result = langgraph_orchestrator.route_to_agent(
        {"request": "Remember this note", "agent_name": AgentName.AUTO, "result": ""}
    )
    assert result == AgentName.DELEGATE


def test_choose_agent_returns_multi_for_multi_intent(monkeypatch):
    monkeypatch.setattr(langgraph_orchestrator, "invoke_prompt", lambda model, prompt: "expense")
    result = langgraph_orchestrator.choose_agent("Log this expense and track my study progress")
    assert result == AgentName.MULTI


def test_run_multi_executes_multiple_agents(monkeypatch):
    monkeypatch.setattr(langgraph_orchestrator, "ExpenseAgent", lambda: type("X", (), {"run": staticmethod(lambda request: "expense saved")})())
    monkeypatch.setattr(langgraph_orchestrator, "LearningTrackerAgent", lambda: type("X", (), {"run": staticmethod(lambda request: "learning saved")})())

    state = {"request": "Log this expense and track my study progress", "agent_name": AgentName.MULTI, "result": ""}
    result_state = langgraph_orchestrator.run_multi(state)
    assert "expense saved" in result_state["result"]
    assert "learning saved" in result_state["result"]
