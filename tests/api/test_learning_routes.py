# Tests full learning entry CRUD and search routes with a faked store
import pytest
from fastapi.testclient import TestClient

from orbit.api import learning_routes
from orbit.app import app


def test_add_and_list_entries(monkeypatch: pytest.MonkeyPatch) -> None:
    row = {"id": 1, "track": "dsa", "topic": "arrays", "status": "in_progress", "note": ""}
    monkeypatch.setattr(learning_routes, "save_entry", lambda *args: row)
    monkeypatch.setattr(learning_routes, "list_entries", lambda: [row])
    client = TestClient(app)
    created = client.post("/learning", json={"track": "dsa", "topic": "arrays"})
    assert created.status_code == 200
    assert client.get("/learning").json() == [row]


def test_edit_entry(monkeypatch: pytest.MonkeyPatch) -> None:
    updated = {"id": 1, "track": "dsa", "topic": "arrays", "status": "done", "note": ""}
    monkeypatch.setattr(learning_routes, "update_entry", lambda *args: updated)
    response = TestClient(app).put("/learning/1", json={"track": "dsa", "topic": "arrays", "status": "done"})
    assert response.json()["status"] == "done"


def test_delete_entry(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(learning_routes, "delete_entry", lambda entry_id: None)
    assert TestClient(app).delete("/learning/1").json() == {"deleted": True}


def test_search_entries(monkeypatch: pytest.MonkeyPatch) -> None:
    rows = [{"id": 1, "track": "dsa", "topic": "arrays", "status": "done", "note": ""}]
    monkeypatch.setattr(learning_routes, "search_entries", lambda q, track, status: rows)
    response = TestClient(app).get("/learning/search", params={"track": "dsa"})
    assert response.json() == rows
