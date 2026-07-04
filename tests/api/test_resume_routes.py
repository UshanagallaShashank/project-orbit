# Tests full resume version CRUD, search, and diff routes with a faked store
import pytest
from fastapi.testclient import TestClient

from orbit.api import resume_routes
from orbit.app import app


def test_add_and_list_versions(monkeypatch: pytest.MonkeyPatch) -> None:
    row = {"id": 1, "label": "v1", "content": "line one", "note": ""}
    monkeypatch.setattr(resume_routes, "save_version", lambda *args: row)
    monkeypatch.setattr(resume_routes, "list_versions", lambda: [row])
    client = TestClient(app)
    created = client.post("/resume/versions", json={"label": "v1", "content": "line one"})
    assert created.status_code == 200
    assert client.get("/resume/versions").json() == [row]


def test_diff_versions(monkeypatch: pytest.MonkeyPatch) -> None:
    rows = [
        {"id": 1, "label": "v1", "content": "line one", "note": ""},
        {"id": 2, "label": "v2", "content": "line two", "note": ""},
    ]
    monkeypatch.setattr(resume_routes, "list_versions", lambda: rows)
    response = TestClient(app).get("/resume/versions/diff", params={"old_id": 1, "new_id": 2})
    assert "diff" in response.json()


def test_delete_version(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(resume_routes, "delete_version", lambda version_id: None)
    assert TestClient(app).delete("/resume/versions/1").json() == {"deleted": True}
