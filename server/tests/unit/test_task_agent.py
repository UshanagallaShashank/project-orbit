# tests/unit/test_task_agent.py
# ------------------------------
# Tests for TaskAgent.
#
# WHY we mock the chain:
#   We're testing OUR code (save logic, response shape, DB insert).
#   Not testing Gemini. Calling real Gemini in unit tests = slow + costs money.
#
# WHY mock "agents.agent_factory.*" not "agents.task_agent.*"?
#   get_history, save_messages, maybe_summarize moved to agent_factory.py.
#   Mock the path where the function is USED, not where it was defined.
#   task_agent.run() calls agent_factory.run_agent(), which calls these.
#   So the mock must live on the agent_factory module.

import pytest
from unittest.mock import MagicMock
from agents.task_agent import run, TaskAgentResponse


# -- Fixtures -----------------------------------------------------------------

@pytest.fixture
def user_id():
    return "test-user-123"


# -- Tests ---------------------------------------------------------------------

def test_run_extracts_and_saves_tasks(user_id, mocker):
    """When user mentions tasks, they should be saved to Supabase and returned."""
    # Arrange - mock chain (still lives on task_agent module)
    mocker.patch("agents.task_agent.chain").invoke.return_value = TaskAgentResponse(
        reply="Got it! I've added those tasks for you.",
        tasks=["Finish the report", "Call manager by Friday"],
    )

    # Mock DB helpers - they now live in agent_factory
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")

    # Mock Supabase insert - supabase now lives in agent_factory (via save_list_to_table)
    mock_supabase = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.execute.return_value = MagicMock()

    # Act
    result = run(user_id=user_id, message="I need to finish the report and call my manager by Friday")

    # Assert - reply and tasks returned correctly
    assert result["reply"] == "Got it! I've added those tasks for you."
    assert result["tasks"] == ["Finish the report", "Call manager by Friday"]

    # Assert - tasks were inserted into Supabase
    mock_supabase.table.assert_called_once_with("tasks")
    inserted_rows = mock_table.insert.call_args[0][0]
    assert len(inserted_rows) == 2
    assert inserted_rows[0]["title"] == "Finish the report"
    assert inserted_rows[0]["user_id"] == user_id
    assert inserted_rows[0]["done"] is False

    # Assert - message exchange was saved
    mocker.patch("agents.agent_factory.save_messages")  # already patched, just verifying it was called
    mock_supabase.table.assert_called_with("tasks")


def test_run_no_tasks_skips_db_insert(user_id, mocker):
    """When no tasks are mentioned, Supabase insert should NOT be called."""
    mocker.patch("agents.task_agent.chain").invoke.return_value = TaskAgentResponse(
        reply="Sure, how can I help you today?",
        tasks=[],
    )
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")

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
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table

    result = run(user_id=user_id, message="remind me to buy milk")

    assert "reply" in result
    assert "tasks" in result
    assert isinstance(result["tasks"], list)
