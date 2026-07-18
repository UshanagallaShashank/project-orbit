# Lets one request fan out to multiple agents at runtime, decided by the LLM as it goes -
# no keyword pre-detection and no agent name supplied by the caller. Each step the LLM sees
# every agent's result so far and either calls another agent or writes the final answer.
import json

from orbit.agents.comms_agent.comms_agent import CommsAgent
from orbit.agents.cost_agent.cost_agent import CostAgent
from orbit.agents.eval_agent.eval_agent import EvalAgent
from orbit.agents.expense_agent.expense_agent import ExpenseAgent
from orbit.agents.idea_agent.idea_agent import IdeaAgent
from orbit.agents.job_agent.job_agent import JobAgent
from orbit.agents.leetcode_agent.leetcode_agent import LeetCodeAgent
from orbit.agents.learning_tracker.learning_tracker_agent import LearningTrackerAgent
from orbit.agents.memory_agent.memory_agent import MemoryAgent
from orbit.agents.project_tracker.project_tracker import ProjectTracker
from orbit.agents.resume_agent.resume_agent import ResumeAgent
from orbit.agents.task_agent.task_agent import TaskAgent
from orbit.core.llm_client import invoke_prompt
from orbit.types.shared import AgentName
from orbit.utils.logger import get_logger

logger = get_logger("delegation")

MAX_STEPS = 5

AGENT_TOOLS: dict[AgentName, tuple[str, object]] = {
    AgentName.EXPENSE: ("Logs an expense from free text and returns what was saved", ExpenseAgent()),
    AgentName.LEARNING_TRACKER: ("Logs study/learning progress for a track", LearningTrackerAgent()),
    AgentName.RESUME: ("Saves or diffs resume versions", ResumeAgent()),
    AgentName.MEMORY: ("Stores a long-term note or memory", MemoryAgent()),
    AgentName.COST: ("Reports LLM spend and budget status", CostAgent()),
    AgentName.EVAL: ("Scores a piece of text or output 1-10 as a judge", EvalAgent()),
    AgentName.IDEA: ("Brainstorms ideas or features", IdeaAgent()),
    AgentName.LEETCODE: ("Tracks LeetCode/DSA practice progress", LeetCodeAgent()),
    AgentName.PROJECT_TRACKER: ("Lists repos and flags stale ones", ProjectTracker()),
    AgentName.TASK: ("Schedules or lists daily tasks", TaskAgent()),
    AgentName.COMMS: ("Drafts an email, never sends it", CommsAgent()),
    AgentName.JOB: ("Searches jobs or manages the approval queue, never auto-submits", JobAgent()),
}

DELEGATION_PROMPT = """You are Orbit's orchestrator. You can call any of these agents by name, \
as many times as you need, in any order. You never ask the user which agent to use - you decide.

Agents available:
{agent_list}

Original request: {request}

Steps taken so far (agent called -> what it returned):
{history}

Decide the next action. Respond with ONLY one JSON object, no other text:
- To call an agent: {{"action": "call", "agent": "<agent_name>", "note": "<what you want this agent to do, can restate the request>"}}
- To finish: {{"action": "finish", "answer": "<final answer combining everything learned above for the user>"}}

Call an agent only if it still has something useful to add. Finish as soon as you have enough \
to answer the original request well. Never call the same agent with the same note twice.
"""


def _format_agent_list() -> str:
    return "\n".join(f"- {name.value}: {desc}" for name, (desc, _agent) in AGENT_TOOLS.items())


def _format_history(history: list[tuple[AgentName, str, str]]) -> str:
    if not history:
        return "(none yet)"
    return "\n".join(f"{i + 1}. {name.value} (\"{note}\") -> {result}" for i, (name, note, result) in enumerate(history))


def _parse_decision(raw: str) -> dict[str, str] | None:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.split("\n", 1)[-1] if "\n" in cleaned else cleaned
    try:
        decision = json.loads(cleaned)
    except json.JSONDecodeError:
        return None
    if not isinstance(decision, dict) or "action" not in decision:
        return None
    return decision


def run_delegated(request: str, on_step: "object | None" = None) -> str:
    """Runs the request through an LLM-driven delegation loop across all agents.

    on_step, if given, is called as on_step(agent_name, note, result) after each agent call -
    the API layer uses this to persist a tool-call trace per step for the dashboard.
    """
    history: list[tuple[AgentName, str, str]] = []
    called: set[tuple[AgentName, str]] = set()

    for step in range(MAX_STEPS):
        prompt = DELEGATION_PROMPT.format(
            agent_list=_format_agent_list(),
            request=request,
            history=_format_history(history),
        )
        raw = invoke_prompt("gemini-2.5-flash-lite", prompt)
        decision = _parse_decision(raw)

        if decision is None:
            logger.warning("Delegation step %d: unparseable decision %r, stopping", step, raw)
            break

        if decision.get("action") == "finish":
            answer = str(decision.get("answer", "")).strip()
            if answer:
                return answer
            break

        if decision.get("action") == "call":
            agent_name_raw = str(decision.get("agent", "")).strip().lower()
            note = str(decision.get("note", request))
            try:
                agent_name = AgentName(agent_name_raw)
            except ValueError:
                logger.warning("Delegation step %d: unknown agent %r, stopping", step, agent_name_raw)
                break
            if agent_name not in AGENT_TOOLS:
                logger.warning("Delegation step %d: agent %s not callable, stopping", step, agent_name)
                break
            if (agent_name, note) in called:
                logger.warning("Delegation step %d: repeat call to %s, stopping", step, agent_name)
                break

            called.add((agent_name, note))
            _desc, agent_instance = AGENT_TOOLS[agent_name]
            result = agent_instance.run(note)  # type: ignore[attr-defined]
            logger.info("Delegated to %s: %s -> %s", agent_name, note, result)
            history.append((agent_name, note, result))
            if on_step is not None:
                on_step(agent_name, note, result)
            continue

        logger.warning("Delegation step %d: unrecognized action %r, stopping", step, decision.get("action"))
        break

    if not history:
        return "Could not determine which agent should handle this request."
    return "\n".join(f"{name.value}: {result}" for name, _note, result in history)
