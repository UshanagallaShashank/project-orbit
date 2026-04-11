# tests/unit/test_memory_agent.py

import pytest
from unittest.mock import MagicMock
from agents.memory_agent import run, MemoryAgentResponse


@pytest.fixture
def user_id():
    return "test-user-123"


def test_run_extracts_and_saves_memories(user_id, mocker):
    """Facts should be saved to memories table and returned."""
    mocker.patch("agents.memory_agent.chain").invoke.return_value = MemoryAgentResponse(
        reply="Got it, I'll remember that.",
        memories=["User is targeting FAANG companies", "User prefers Python over Java"],
    )
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.execute.return_value = MagicMock()

    result = run(user_id=user_id, message="Remember that I'm targeting FAANG and prefer Python")

    assert result["reply"] == "Got it, I'll remember that."
    assert len(result["memories"]) == 2
    mock_supabase.table.assert_called_once_with("memories")
    inserted_rows = mock_table.insert.call_args[0][0]
    assert inserted_rows[0]["content"] == "User is targeting FAANG companies"
    assert inserted_rows[0]["user_id"] == user_id


def test_run_no_memories_skips_db_insert(user_id, mocker):
    """No DB insert when nothing to remember."""
    mocker.patch("agents.memory_agent.chain").invoke.return_value = MemoryAgentResponse(
        reply="Sure, what would you like me to remember?",
        memories=[],
    )
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")

    result = run(user_id=user_id, message="hey")

    assert result["memories"] == []
    mock_supabase.table.assert_not_called()


def test_run_returns_reply_and_memories_keys(user_id, mocker):
    """run() must always return both reply and memories keys."""
    mocker.patch("agents.memory_agent.chain").invoke.return_value = MemoryAgentResponse(
        reply="Saved!", memories=["User is 2 years into backend engineering"]
    )
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")
    mock_supabase = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_table

    result = run(user_id=user_id, message="remember I have 2 years of backend experience")

    assert "reply" in result
    assert "memories" in result
    assert isinstance(result["memories"], list)
