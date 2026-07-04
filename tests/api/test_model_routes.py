# Tests that the model test route returns a clean 502 when every provider fails
import httpx
import pytest
from fastapi.testclient import TestClient

from orbit.app import app
from orbit.core import model_router


def test_returns_502_when_all_models_fail(monkeypatch: pytest.MonkeyPatch) -> None:
    def always_fail(model: str, prompt: str) -> str:
        raise httpx.ConnectError("everything is down")

    monkeypatch.setattr(model_router, "complete", always_fail)
    response = TestClient(app).post("/models/test", json={"prompt": "hi"})
    assert response.status_code == 502
    assert "Both models failed" in response.json()["detail"]


def test_returns_answer_when_fallback_succeeds(monkeypatch: pytest.MonkeyPatch) -> None:
    def gemini_down(model: str, prompt: str) -> str:
        if model.startswith("gemini"):
            raise httpx.ConnectError("gemini is down")
        return "answer from grok"

    monkeypatch.setattr(model_router, "complete", gemini_down)
    response = TestClient(app).post("/models/test", json={"prompt": "hi"})
    assert response.status_code == 200
    assert response.json()["model"] == "grok-4-1-fast"
