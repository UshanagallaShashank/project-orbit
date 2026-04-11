# tests/unit/test_task_agent.py
# ──────────────────────────────
# Tests for TaskAgent.
#
# WHY we mock the chain:
#   We're testing OUR code (save logic, response shape, DB insert).
#   Not testing Gemini. Calling real Gemini in unit tests = slow + costs money.
#
# What we test:
#   1. Normal message with tasks → tasks saved to Supabase + returned
#   2. Message with no tasks → empty list, no DB insert
#   3. run() always returns { reply, tasks }

import pytest
from unittest.mock import MagicMock, patch, call
from agents.task_agent import run, TaskAgentResponse


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def user_id():
    return "test-user-123"


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_run_extracts_and_saves_tasks(user_id, mocker):
    """When user mentions tasks, they should be saved to Supabase and returned."""
    # Arrange — mock chain to return structured response with tasks
    mock_chain = mocker.patch("agents.task_agent.chain")
    mock_chain.invoke.return_value = TaskAgentResponse(
        reply="Got it! I've added those tasks for you.",
        tasks=["Finish the report", "Call manager by Friday"],
    )

    # Mock DB helpers so we don't hit real Supabase
    mock_get_history = mocker.patch("agents.task_agent.get_history", return_value=([], 0))
    mock_save_messages = mocker.patch("agents.task_agent.save_messages")
    mock_summarize = mocker.patch("agents.task_agent.maybe_summarize")

    # Mock Supabase insert chain: supabase.table().insert().execute()
    mock_supabase = mocker.patch("agents.task_agent.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.execute.return_value = MagicMock()

    # Act
    result = run(user_id=user_id, message="I need to finish the report and call my manager by Friday")

    # Assert — reply and tasks returned correctly
    assert result["reply"] == "Got it! I've added those tasks for you."
    assert result["tasks"] == ["Finish the report", "Call manager by Friday"]

    # Assert — tasks were inserted into Supabase
    mock_supabase.table.assert_called_once_with("tasks")
    inserted_rows = mock_table.insert.call_args[0][0]
    assert len(inserted_rows) == 2
    assert inserted_rows[0]["title"] == "Finish the report"
    assert inserted_rows[0]["user_id"] == user_id
    assert inserted_rows[0]["done"] is False

    # Assert — message exchange was saved
    mock_save_messages.assert_called_once_with(
        user_id,
        "task",
        "I need to finish the report and call my manager by Friday",
        "Got it! I've added those tasks for you.",
    )


def test_run_no_tasks_skips_db_insert(user_id, mocker):
    """When no tasks are mentioned, Supabase insert should NOT be called."""
    mocker.patch("agents.task_agent.chain").invoke.return_value = TaskAgentResponse(
        reply="Sure, how can I help you today?",
        tasks=[],
    )
    mocker.patch("agents.task_agent.get_history", return_value=([], 0))
    mocker.patch("agents.task_agent.save_messages")
    mocker.patch("agents.task_agent.maybe_summarize")
    mock_supabase = mocker.patch("agents.task_agent.supabase")

    result = run(user_id=user_id, message="Hey, what's up?")

    assert result["tasks"] == []
    # Supabase table() should never be called when there are no tasks
    mock_supabase.table.assert_not_called()


def test_run_always_returns_reply_and_tasks_keys(user_id, mocker):
    """run() must always return a dict with both 'reply' and 'tasks'."""
    mocker.patch("agents.task_agent.chain").invoke.return_value = TaskAgentResponse(
        reply="On it!",
        tasks=["Buy milk"],
    )
    mocker.patch("agents.task_agent.get_history", return_value=([], 0))
    mocker.patch("agents.task_agent.save_messages")
    mocker.patch("agents.task_agent.maybe_summarize")
    mock_supabase = mocker.patch("agents.task_agent.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table

    result = run(user_id=user_id, message="remind me to buy milk")

    assert "reply" in result
    assert "tasks" in result
    assert isinstance(result["tasks"], list)
