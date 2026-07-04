# Tests that the expense parser turns model JSON output into a clean dict
import pytest

from orbit.agents.expense_agent import expense_parser


def test_parses_plain_json(monkeypatch: pytest.MonkeyPatch) -> None:
    answer = '{"amount": 250, "category": "food", "note": "lunch"}'
    monkeypatch.setattr(
        expense_parser.ModelRouter, "ask", lambda self, role, prompt: ("gemini", answer)
    )
    parsed = expense_parser.parse_expense("spent 250 on lunch")
    assert parsed == {"amount": 250, "category": "food", "note": "lunch"}


def test_parses_json_wrapped_in_code_fence(monkeypatch: pytest.MonkeyPatch) -> None:
    answer = '```json\n{"amount": 90, "category": "transport", "note": "auto"}\n```'
    monkeypatch.setattr(
        expense_parser.ModelRouter, "ask", lambda self, role, prompt: ("gemini", answer)
    )
    parsed = expense_parser.parse_expense("90 for auto")
    assert parsed["amount"] == 90
    assert parsed["category"] == "transport"
