# tests/unit/test_mentor_agent.py

import pytest
from agents.mentor_agent import run


@pytest.fixture
def user_id():
    return "test-user-123"


def test_run_returns_reply(user_id, mocker):
    """MentorAgent should return a plain reply dict."""
    mock_chain = mocker.patch("agents.mentor_agent.chain")
    mock_chain.invoke.return_value.content = "Focus on sliding window and two pointers this week."

    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")

    result = run(user_id=user_id, message="what DSA topic should I focus on?")

    assert result["reply"] == "Focus on sliding window and two pointers this week."
    assert "reply" in result


def test_run_uses_conversation_history(user_id, mocker):
    """MentorAgent should pass history to the chain."""
    from langchain_core.messages import HumanMessage, AIMessage
    fake_history = [
        HumanMessage(content="I've been doing arrays"),
        AIMessage(content="Good start, move to strings next"),
    ]
    mock_get_history = mocker.patch("agents.agent_factory.get_history", return_value=(fake_history, 2))
    mock_chain = mocker.patch("agents.mentor_agent.chain")
    mock_chain.invoke.return_value.content = "Now tackle trees."
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")

    run(user_id=user_id, message="what's next after strings?")

    call_args = mock_chain.invoke.call_args[0][0]
    assert call_args["history"] == fake_history


def test_run_no_tasks_or_entries_keys(user_id, mocker):
    """MentorAgent response should only have 'reply' - no tasks or entries."""
    mocker.patch("agents.mentor_agent.chain").invoke.return_value.content = "Here is my advice."
    mocker.patch("agents.agent_factory.get_history", return_value=([], 0))
    mocker.patch("agents.agent_factory.save_messages")
    mocker.patch("agents.agent_factory.maybe_summarize")

    result = run(user_id=user_id, message="help me")

    assert set(result.keys()) == {"reply"}
