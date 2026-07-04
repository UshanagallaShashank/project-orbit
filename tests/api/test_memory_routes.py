# Tests full memory CRUD and search routes with a faked store
import pytest
from fastapi.testclient import TestClient

from orbit.api import memory_routes
from orbit.app import app


def test_add_and_list_memories(monkeypatch: pytest.MonkeyPatch) -> None:
    row = {"id": 1, "content": "prefers dark mode", "tag": "general"}
    monkeypatch.setattr(memory_routes, "save_memory", lambda *args: row)
    monkeypatch.setattr(memory_routes, "list_memories", lambda: [row])
    client = TestClient(app)
    created = client.post("/memories", json={"content": "prefers dark mode"})
    assert created.status_code == 200
    assert client.get("/memories").json() == [row]


def test_search_memories(monkeypatch: pytest.MonkeyPatch) -> None:
    rows = [{"id": 1, "content": "prefers dark mode", "tag": "general"}]
    monkeypatch.setattr(memory_routes, "search_memories", lambda q, tag: rows)
    response = TestClient(app).get("/memories/search", params={"q": "dark"})
    assert response.json() == rows


def test_delete_memory(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(memory_routes, "delete_memory", lambda memory_id: None)
    assert TestClient(app).delete("/memories/1").json() == {"deleted": True}
