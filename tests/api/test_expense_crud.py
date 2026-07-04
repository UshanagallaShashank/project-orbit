# Tests expense update, delete, and search routes with a faked store
import pytest
from fastapi.testclient import TestClient

from orbit.api import expense_routes
from orbit.app import app


def test_edit_expense(monkeypatch: pytest.MonkeyPatch) -> None:
    updated = {"id": 1, "amount": 300, "category": "food", "note": "dinner"}
    monkeypatch.setattr(expense_routes, "update_expense", lambda *args: updated)
    response = TestClient(app).put("/expenses/1", json={"amount": 300, "category": "food", "note": "dinner"})
    assert response.status_code == 200
    assert response.json() == updated


def test_delete_expense(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(expense_routes, "delete_expense", lambda expense_id: None)
    response = TestClient(app).delete("/expenses/1")
    assert response.json() == {"deleted": True}


def test_search_expenses(monkeypatch: pytest.MonkeyPatch) -> None:
    rows = [{"id": 1, "amount": 250, "category": "food", "note": "lunch"}]
    monkeypatch.setattr(expense_routes, "search_expenses", lambda q, category, start, end: rows)
    response = TestClient(app).get("/expenses/search", params={"q": "lunch"})
    assert response.json() == rows
