# Tests that the monthly rollup only counts this month and subtracts from budget
from datetime import datetime, timezone

import pytest

from orbit.agents.expense_agent import expense_rollup


def test_summary_counts_only_current_month(monkeypatch: pytest.MonkeyPatch) -> None:
    this_month = datetime.now(timezone.utc).strftime("%Y-%m") + "-02T10:00:00+00:00"
    rows: list[dict[str, object]] = [
        {"amount": 250, "category": "food", "note": "", "created_at": this_month},
        {"amount": 100, "category": "food", "note": "", "created_at": "2020-01-15T10:00:00+00:00"},
    ]
    monkeypatch.setattr(expense_rollup, "list_expenses", lambda limit=1000: rows)
    summary = expense_rollup.month_summary()
    assert summary["spent"] == 250
    assert summary["remaining"] == expense_rollup.MONTHLY_BUDGET_INR - 250


def test_summary_with_no_expenses(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(expense_rollup, "list_expenses", lambda limit=1000: [])
    summary = expense_rollup.month_summary()
    assert summary["spent"] == 0
    assert summary["remaining"] == summary["budget"]
