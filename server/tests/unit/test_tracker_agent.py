# tests/unit/test_tracker_agent.py

import pytest
from unittest.mock import MagicMock
from agents.tracker_agent import run, TrackerAgentResponse


@pytest.fixture
def user_id():
    return "test-user-123"


def test_run_extracts_and_saves_entries(user_id, mocker):
    """Progress entries should be saved to tracker_entries and returned."""
    mocker.patch("agents.tracker_agent.chain").invoke.return_value = TrackerAgentResponse(
        reply="Great work! Logged your progress.",
        entries=["Solved 3 medium DP problems", "Reviewed sliding window"],
    )
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.execute.return_value = MagicMock()

    result = run(user_id=user_id, message="I solved 3 medium DP problems today")

    assert result["reply"] == "Great work! Logged your progress."
    assert len(result["entries"]) == 2
    mock_supabase.table.assert_called_once_with("tracker_entries")
    inserted_rows = mock_table.insert.call_args[0][0]
    assert inserted_rows[0]["content"] == "Solved 3 medium DP problems"
    assert inserted_rows[0]["user_id"] == user_id


def test_run_no_entries_skips_db_insert(user_id, mocker):
    """No DB insert when no progress was logged."""
    mocker.patch("agents.tracker_agent.chain").invoke.return_value = TrackerAgentResponse(
        reply="What did you practice today?",
        entries=[],
    )
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")

    result = run(user_id=user_id, message="hey")

    assert result["entries"] == []
    mock_supabase.table.assert_not_called()


def test_run_returns_reply_and_entries_keys(user_id, mocker):
    """run() must always return both reply and entries keys."""
    mocker.patch("agents.tracker_agent.chain").invoke.return_value = TrackerAgentResponse(
        reply="Logged!", entries=["Did 30 min of arrays"]
    )
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table

    result = run(user_id=user_id, message="did arrays for 30 min")

    assert "reply" in result
    assert "entries" in result
    assert isinstance(result["entries"], list)
