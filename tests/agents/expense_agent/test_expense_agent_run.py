# Tests that ExpenseAgent saves parsed expenses and rejects entries with no amount
import pytest

from orbit.agents.expense_agent import expense_agent


def test_run_saves_and_confirms(monkeypatch: pytest.MonkeyPatch) -> None:
    saved: dict[str, object] = {}

    def fake_save(amount: float, category: str, note: str) -> dict[str, object]:
        saved.update({"amount": amount, "category": category, "note": note})
        return saved

    monkeypatch.setattr(
        expense_agent,
        "parse_expense",
        lambda text: {"amount": 250, "category": "food", "note": "lunch"},
    )
    monkeypatch.setattr(expense_agent, "save_expense", fake_save)
    result = expense_agent.ExpenseAgent().run("spent 250 on lunch")
    assert saved["amount"] == 250
    assert "Logged 250 INR under food" in result


def test_run_rejects_missing_amount(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        expense_agent, "parse_expense", lambda text: {"amount": 0, "category": "other", "note": ""}
    )
    result = expense_agent.ExpenseAgent().run("hello there")
    assert "Could not find an amount" in result
