# Tests that guardrails block destructive operations and allow normal requests
from orbit.core.guardrails import is_safe


def test_blocks_drop_table() -> None:
    assert is_safe("please DROP TABLE expenses") is False


def test_blocks_force_push() -> None:
    assert is_safe("git force-push to main") is False


def test_allows_normal_request() -> None:
    assert is_safe("log a 250 rupee lunch expense") is True
