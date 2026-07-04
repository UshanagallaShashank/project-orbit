# Tests that ModelRouter.ask swaps from Gemini to Grok when the first call fails
import httpx
import pytest

from orbit.core import model_router
from orbit.types.shared import ModelRole


def test_ask_returns_primary_model_answer(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(model_router, "complete", lambda model, prompt: f"answer from {model}")
    model, answer = model_router.ModelRouter().ask(ModelRole.DEFAULT, "hi")
    assert model == "gemini-2.5-flash-lite"
    assert answer == "answer from gemini-2.5-flash-lite"


def test_ask_swaps_to_grok_when_gemini_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    def flaky_complete(model: str, prompt: str) -> str:
        if model.startswith("gemini"):
            raise httpx.ConnectError("gemini is down")
        return f"answer from {model}"

    monkeypatch.setattr(model_router, "complete", flaky_complete)
    model, answer = model_router.ModelRouter().ask(ModelRole.DEFAULT, "hi")
    assert model == "grok-4-1-fast"
    assert answer == "answer from grok-4-1-fast"
