# Tests that llm_client picks the right provider endpoint and key per model name
import httpx
import pytest

from orbit.core import llm_client


class FakeResponse:
    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict[str, list[dict[str, dict[str, str]]]]:
        return {"choices": [{"message": {"content": "hello"}}]}


def test_grok_model_uses_xai_endpoint(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: dict[str, str] = {}
    monkeypatch.setenv("XAI_API_KEY", "fake-key")

    def fake_post(url: str, **kwargs: object) -> FakeResponse:
        seen["url"] = url
        return FakeResponse()

    monkeypatch.setattr(httpx, "post", fake_post)
    assert llm_client.complete("grok-4-1-fast", "hi") == "hello"
    assert seen["url"].startswith("https://api.x.ai")


def test_gemini_model_uses_google_endpoint(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: dict[str, str] = {}
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")

    def fake_post(url: str, **kwargs: object) -> FakeResponse:
        seen["url"] = url
        return FakeResponse()

    monkeypatch.setattr(httpx, "post", fake_post)
    assert llm_client.complete("gemini-2.5-flash-lite", "hi") == "hello"
    assert seen["url"].startswith("https://generativelanguage.googleapis.com")
