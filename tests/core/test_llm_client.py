# Tests that llm_client picks the right provider endpoint and key per model name
import os

import pytest

from orbit.core import llm_client


class FakeResponse:
    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict[str, list[dict[str, dict[str, str]]]]:
        return {"choices": [{"message": {"content": "hello"}}]}


def test_grok_model_uses_xai_provider(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: dict[str, str | None] = {}

    class FakeModel:
        def generate(self, messages: list[list[llm_client.HumanMessage]]) -> object:
            seen["messages"] = messages
            return type(
                "FakeResult",
                (),
                {
                    "generations": [[type("G", (), {"message": type("M", (), {"content": "hello"})})()]],
                    "llm_output": {"usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2}},
                },
            )()

    def fake_init_chat_model(model: str, model_provider: str | None = None, **kwargs: object) -> FakeModel:
        seen["model"] = model
        seen["model_provider"] = model_provider
        return FakeModel()

    monkeypatch.setattr(llm_client.chat_base, "init_chat_model", fake_init_chat_model)

    assert llm_client.complete("grok-4-1-fast", "hi") == "hello"
    assert seen["model"] == "grok-4-1-fast"
    assert seen["model_provider"] == "xai"


def test_gemini_model_uses_google_genai_provider(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: dict[str, str | None] = {}

    class FakeModel:
        def generate(self, messages: list[list[llm_client.HumanMessage]]) -> object:
            seen["messages"] = messages
            return type(
                "FakeResult",
                (),
                {
                    "generations": [[type("G", (), {"message": type("M", (), {"content": "hello"})})()]],
                    "llm_output": {"usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2}},
                },
            )()

    def fake_init_chat_model(model: str, model_provider: str | None = None, **kwargs: object) -> FakeModel:
        seen["model"] = model
        seen["model_provider"] = model_provider
        return FakeModel()

    monkeypatch.setattr(llm_client.chat_base, "init_chat_model", fake_init_chat_model)

    assert llm_client.complete("gemini-2.5-flash-lite", "hi") == "hello"
    assert seen["model"] == "gemini-2.5-flash-lite"
    assert seen["model_provider"] == "google_genai"


def test_prompt_chain_invokes_via_langchain_runtime(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(llm_client, "complete", lambda model, prompt: "hello")
    chain = llm_client.build_prompt_chain("gemini-2.5-flash-lite")
    assert chain.invoke({"text": "hi"}) == "hello"


def test_complete_tracks_cost_in_inr_and_sets_metadata(monkeypatch: pytest.MonkeyPatch) -> None:
    metadata: dict[str, object] = {}

    class FakeModel:
        def generate(self, messages: list[list[llm_client.HumanMessage]]) -> object:
            return type(
                "FakeResult",
                (),
                {
                    "generations": [[type("G", (), {"message": type("M", (), {"content": "hello"})})()]],
                    "llm_output": {"usage": {"prompt_tokens": 1000, "completion_tokens": 2000, "total_tokens": 3000}},
                },
            )()

    def fake_init_chat_model(model: str, model_provider: str | None = None, **kwargs: object) -> FakeModel:
        return FakeModel()

    def fake_set_run_metadata(**kwargs: object) -> None:
        metadata.update(kwargs)

    monkeypatch.setattr(llm_client.chat_base, "init_chat_model", fake_init_chat_model)
    monkeypatch.setattr(llm_client, "set_run_metadata", fake_set_run_metadata)

    result = llm_client.complete("grok-4-1-fast", "hi")
    assert result == "hello"
    assert metadata["currency"] == "INR"
    assert metadata["selected_model"] == "grok-4-1-fast"
    assert metadata["models"] == ["grok-4-1-fast"]
    assert metadata["prompt_tokens"] == 1000
    assert metadata["completion_tokens"] == 2000
    assert metadata["total_tokens"] == 3000
    assert metadata["cost"] == 0.0996


def test_trace_orbit_wraps_functions_when_tracing_is_enabled(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LANGSMITH_TRACING", "true")

    @llm_client.trace_orbit
    def add_one(value: int) -> int:
        return value + 1

    assert add_one(4) == 5


def test_traced_orchestrator_run_records_agent_path(monkeypatch: pytest.MonkeyPatch) -> None:
    from orbit.core import langgraph_orchestrator

    monkeypatch.setenv("LANGSMITH_TRACING", "true")

    class FakeAgent:
        def run(self, request: str) -> str:
            return f"handled:{request}"

    monkeypatch.setattr(langgraph_orchestrator, "LearningTrackerAgent", lambda: FakeAgent())
    monkeypatch.setattr(langgraph_orchestrator, "ExpenseAgent", lambda: FakeAgent())
    monkeypatch.setattr(langgraph_orchestrator, "ResumeAgent", lambda: FakeAgent())
    monkeypatch.setattr(langgraph_orchestrator, "MemoryAgent", lambda: FakeAgent())

    state = langgraph_orchestrator.run_learning_tracker({"request": "hi", "agent_name": "testing", "result": ""})
    assert state["result"] == "handled:hi"


def test_trace_orbit_enables_when_api_key_is_present(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("LANGSMITH_TRACING", raising=False)
    monkeypatch.delenv("LANGSMITH_PROJECT", raising=False)
    monkeypatch.setenv("LANGSMITH_API_KEY", "fake-key")

    @llm_client.trace_orbit
    def add_two(value: int) -> int:
        return value + 2

    assert add_two(3) == 5
    assert os.environ["LANGSMITH_PROJECT"] == "v-orbit"
