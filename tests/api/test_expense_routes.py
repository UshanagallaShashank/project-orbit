# Tests the expense routes with a faked store so no real database is needed
import pytest
from fastapi.testclient import TestClient

from orbit.api import expense_routes
from orbit.app import app


def test_add_and_list_expenses(monkeypatch: pytest.MonkeyPatch) -> None:
    rows: list[dict[str, object]] = []

    def fake_save(amount: float, category: str, note: str) -> dict[str, object]:
        row: dict[str, object] = {"id": 1, "amount": amount, "category": category, "note": note}
        rows.append(row)
        return row

    monkeypatch.setattr(expense_routes, "save_expense", fake_save)
    monkeypatch.setattr(expense_routes, "list_expenses", lambda: rows)
    client = TestClient(app)
    created = client.post("/expenses", json={"amount": 250, "category": "food", "note": "lunch"})
    assert created.status_code == 200
    assert client.get("/expenses").json() == [created.json()]


def test_rejects_zero_amount() -> None:
    response = TestClient(app).post("/expenses", json={"amount": 0, "category": "food"})
    assert response.status_code == 422


def test_summary_route(monkeypatch: pytest.MonkeyPatch) -> None:
    fake = {"spent": 250.0, "budget": 75000.0, "remaining": 74750.0}
    monkeypatch.setattr(expense_routes, "month_summary", lambda: fake)
    assert TestClient(app).get("/expenses/summary").json() == fake
