# tests/unit/test_data_agent.py

import pytest
from unittest.mock import MagicMock, call
from agents.data_agent import run, DataAgentResponse


@pytest.fixture
def user_id():
    return "test-user-123"


def _mock_supabase_context(mocker, tasks=None, entries=None, memories=None):
    """
    Helper: mock fetch_user_context's Supabase calls.
    Returns a mock supabase that returns empty tables by default.
    """
    mock_sb = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.select.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.order.return_value = mock_table
    mock_table.limit.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.execute.return_value = MagicMock(data=tasks or [])
    return mock_sb, mock_table


def test_run_saves_all_three_types(user_id, mocker):
    """A single message can produce tasks, entries, AND memories at once."""
    mocker.patch("agents.data_agent.fetch_user_context", return_value="")
    mocker.patch("agents.data_agent.make_chain").return_value.invoke.return_value = DataAgentResponse(
        reply="Logged your session, added your task, and saved that preference.",
        tasks=["Review trees tomorrow"],
        entries=["Solved 3 medium DP problems"],
        memories=["User prefers Python over Java"],
    )
    mocker.patch("agents.data_agent.get_history", return_value=([], 0))
    mocker.patch("agents.data_agent.save_messages")
    mocker.patch("agents.data_agent.maybe_summarize")
    mock_sb = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.execute.return_value = MagicMock()

    result = run(user_id=user_id, message="I solved 3 DP problems, need to review trees tomorrow, and I prefer Python")

    assert result["tasks"]    == ["Review trees tomorrow"]
    assert result["entries"]  == ["Solved 3 medium DP problems"]
    assert result["memories"] == ["User prefers Python over Java"]

    # Three separate table inserts - one per data type
    tables_inserted = [c.args[0] for c in mock_sb.table.call_args_list]
    assert "tasks" in tables_inserted
    assert "tracker_entries" in tables_inserted
    assert "memories" in tables_inserted


def test_run_empty_lists_skip_db_insert(user_id, mocker):
    """If no data extracted, no inserts happen."""
    mocker.patch("agents.data_agent.fetch_user_context", return_value="")
    mocker.patch("agents.data_agent.make_chain").return_value.invoke.return_value = DataAgentResponse(
        reply="Hey! What's on your mind?",
        tasks=[], entries=[], memories=[],
    )
    mocker.patch("agents.data_agent.get_history", return_value=([], 0))
    mocker.patch("agents.data_agent.save_messages")
    mocker.patch("agents.data_agent.maybe_summarize")
    mock_sb = mocker.patch("agents.agent_factory.supabase")

    result = run(user_id=user_id, message="hey")

    assert result["tasks"] == []
    assert result["entries"] == []
    assert result["memories"] == []
    mock_sb.table.assert_not_called()


def test_run_context_injected_into_prompt(user_id, mocker):
    """fetch_user_context result must be passed into build_prompt."""
    mock_context = mocker.patch("agents.data_agent.fetch_user_context", return_value="=== User Context ===\nOpen tasks:\n- Review trees")
    mock_build   = mocker.patch("agents.data_agent.build_prompt", return_value="injected system prompt")
    mocker.patch("agents.data_agent.make_chain").return_value.invoke.return_value = DataAgentResponse(reply="Got it", tasks=[], entries=[], memories=[])
    mocker.patch("agents.data_agent.get_history", return_value=([], 0))
    mocker.patch("agents.data_agent.save_messages")
    mocker.patch("agents.data_agent.maybe_summarize")
    mocker.patch("agents.agent_factory.supabase")

    run(user_id=user_id, message="anything")

    mock_context.assert_called_once_with(user_id)
    mock_build.assert_called_once_with("=== User Context ===\nOpen tasks:\n- Review trees")


def test_run_always_returns_all_four_keys(user_id, mocker):
    """Response must always contain reply, tasks, entries, memories."""
    mocker.patch("agents.data_agent.fetch_user_context", return_value="")
    mocker.patch("agents.data_agent.make_chain").return_value.invoke.return_value = DataAgentResponse(
        reply="On it!", tasks=["Buy milk"], entries=[], memories=[]
    )
    mocker.patch("agents.data_agent.get_history", return_value=([], 0))
    mocker.patch("agents.data_agent.save_messages")
    mocker.patch("agents.data_agent.maybe_summarize")
    mock_sb = mocker.patch("agents.agent_factory.supabase")
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.insert.return_value = mock_table

    result = run(user_id=user_id, message="buy milk")

    assert {"reply", "tasks", "entries", "memories"} == set(result.keys())
