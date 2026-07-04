# Builds the LangGraph state machine that routes each request to the right agent
from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from orbit.core.llm_client import invoke_prompt, trace_orbit

from orbit.agents.comms_agent.comms_agent import CommsAgent
from orbit.agents.cost_agent.cost_agent import CostAgent
from orbit.agents.eval_agent.eval_agent import EvalAgent
from orbit.agents.expense_agent.expense_agent import ExpenseAgent
from orbit.agents.idea_agent.idea_agent import IdeaAgent
from orbit.agents.learning_tracker.learning_tracker_agent import LearningTrackerAgent
from orbit.agents.leetcode_agent.leetcode_agent import LeetCodeAgent
from orbit.agents.memory_agent.memory_agent import MemoryAgent
from orbit.agents.project_tracker.project_tracker import ProjectTracker
from orbit.agents.resume_agent.resume_agent import ResumeAgent
from orbit.agents.task_agent.task_agent import TaskAgent
from orbit.agents.feature_agent.feature_agent import FeatureAgent
from orbit.agents.job_agent.job_agent import JobAgent
from orbit.agents.prompt_lab.prompt_lab import PromptLab
from orbit.agents.sandbox_agent.sandbox_agent import SandboxAgent
from orbit.types.shared import AgentName


class OrbitState(TypedDict):
    request: str
    agent_name: AgentName
    result: str


@trace_orbit
def run_learning_tracker(state: OrbitState) -> OrbitState:
    return {**state, "result": LearningTrackerAgent().run(state["request"])}


@trace_orbit
def run_expense(state: OrbitState) -> OrbitState:
    return {**state, "result": ExpenseAgent().run(state["request"])}


@trace_orbit
def run_resume(state: OrbitState) -> OrbitState:
    return {**state, "result": ResumeAgent().run(state["request"])}


@trace_orbit
def run_memory(state: OrbitState) -> OrbitState:
    return {**state, "result": MemoryAgent().run(state["request"])}


@trace_orbit
def run_cost(state: OrbitState) -> OrbitState:
    return {**state, "result": CostAgent().run(state["request"])}


@trace_orbit
def run_eval(state: OrbitState) -> OrbitState:
    return {**state, "result": EvalAgent().run(state["request"])}


@trace_orbit
def run_idea(state: OrbitState) -> OrbitState:
    return {**state, "result": IdeaAgent().run(state["request"])}


@trace_orbit
def run_leetcode(state: OrbitState) -> OrbitState:
    return {**state, "result": LeetCodeAgent().run(state["request"])}


@trace_orbit
def run_project_tracker(state: OrbitState) -> OrbitState:
    return {**state, "result": ProjectTracker().run(state["request"])}


@trace_orbit
def run_task(state: OrbitState) -> OrbitState:
    return {**state, "result": TaskAgent().run(state["request"])}


@trace_orbit
def run_comms(state: OrbitState) -> OrbitState:
    return {**state, "result": CommsAgent().run(state["request"])}


def detect_agents(request: str) -> list[AgentName]:
    normalized = request.lower()
    selected: list[AgentName] = []
    if any(keyword in normalized for keyword in ["expense", "spent", "pay", "purchase", "bill", "subscription"]):
        selected.append(AgentName.EXPENSE)
    if any(keyword in normalized for keyword in ["study", "learn", "progress", "task", "todo", "project", "practice"]):
        selected.append(AgentName.LEARNING_TRACKER)
    if any(keyword in normalized for keyword in ["resume", "cv", "job", "interview", "linkedin", "career"]):
        selected.append(AgentName.RESUME)
    if any(keyword in normalized for keyword in ["remember", "memory", "note", "save this", "recall"]):
        selected.append(AgentName.MEMORY)
    if any(keyword in normalized for keyword in ["cost", "spend", "budget", "expense", "price", "money"]):
        selected.append(AgentName.COST)
    if any(keyword in normalized for keyword in ["eval", "score", "rate", "judge", "quality", "review"]):
        selected.append(AgentName.EVAL)
    if any(keyword in normalized for keyword in ["idea", "brainstorm", "feature", "suggest", "propose"]):
        selected.append(AgentName.IDEA)
    return list(dict.fromkeys(selected))


AGENT_SELECTION_PROMPT = """You are an orchestrator helping Orbit select the best agent.

Agents:
- learning_tracker: logs study progress and learning activity
- expense: records expense entries and spending information
- resume: saves resume content or resume versions
- memory: stores long-term memory or general notes
- cost: tracks spending, budget, AI costs
- eval: scores agent outputs, judges quality
- idea: brainstorms features and project ideas

Choose exactly one agent name from the list above that best matches the user request.
Respond with only the agent name, no extra explanation.

Request:
{request}
"""


def choose_agent(request: str) -> AgentName:
    agents = detect_agents(request)
    if len(agents) == 1:
        return agents[0]
    if len(agents) > 1:
        return AgentName.MULTI

    response = invoke_prompt("gemini-2.5-flash-lite", AGENT_SELECTION_PROMPT.format(request=request))
    normalized = response.strip().lower()
    if normalized in {agent.value for agent in AgentName if agent not in {AgentName.AUTO}}:
        return AgentName(normalized)

    if "expense" in normalized or "spend" in normalized or "purchase" in normalized or "bill" in normalized or "subscription" in normalized:
        return AgentName.EXPENSE
    if "resume" in normalized or "cv" in normalized or "job" in normalized or "interview" in normalized:
        return AgentName.RESUME
    if "memory" in normalized or "remember" in normalized or "note" in normalized:
        return AgentName.MEMORY
    if "learn" in normalized or "study" in normalized or "progress" in normalized or "practice" in normalized or "task" in normalized:
        return AgentName.LEARNING_TRACKER

    return AgentName.LEARNING_TRACKER


def choose_agents(request: str) -> list[AgentName]:
    agents = detect_agents(request)
    if agents:
        return agents
    return [choose_agent(request)]


@trace_orbit
def run_multi(state: OrbitState) -> OrbitState:
    agents = choose_agents(state["request"])
    results: list[str] = []
    for agent in agents:
        if agent == AgentName.EXPENSE:
            results.append(ExpenseAgent().run(state["request"]))
        elif agent == AgentName.LEARNING_TRACKER:
            results.append(LearningTrackerAgent().run(state["request"]))
        elif agent == AgentName.RESUME:
            results.append(ResumeAgent().run(state["request"]))
        elif agent == AgentName.MEMORY:
            results.append(MemoryAgent().run(state["request"]))
        elif agent == AgentName.COST:
            results.append(CostAgent().run(state["request"]))
        elif agent == AgentName.EVAL:
            results.append(EvalAgent().run(state["request"]))
        elif agent == AgentName.IDEA:
            results.append(IdeaAgent().run(state["request"]))
        elif agent == AgentName.LEETCODE:
            results.append(LeetCodeAgent().run(state["request"]))
        elif agent == AgentName.PROJECT_TRACKER:
            results.append(ProjectTracker().run(state["request"]))
        elif agent == AgentName.TASK:
            results.append(TaskAgent().run(state["request"]))
        elif agent == AgentName.COMMS:
            results.append(CommsAgent().run(state["request"]))
    return {**state, "result": "\n".join(results)}


@trace_orbit
def route_to_agent(state: OrbitState) -> str:
    if state["agent_name"] == AgentName.AUTO:
        return choose_agent(state["request"])
    return state["agent_name"]


def build_orbit_graph() -> StateGraph[OrbitState]:
    graph: StateGraph[OrbitState] = StateGraph(OrbitState)
    graph.add_node(AgentName.LEARNING_TRACKER, run_learning_tracker)
    graph.add_node(AgentName.EXPENSE, run_expense)
    graph.add_node(AgentName.RESUME, run_resume)
    graph.add_node(AgentName.MEMORY, run_memory)
    graph.add_node(AgentName.COST, run_cost)
    graph.add_node(AgentName.EVAL, run_eval)
    graph.add_node(AgentName.IDEA, run_idea)
    graph.add_node(AgentName.LEETCODE, run_leetcode)
    graph.add_node(AgentName.PROJECT_TRACKER, run_project_tracker)
    graph.add_node(AgentName.TASK, run_task)
    graph.add_node(AgentName.COMMS, run_comms)
    graph.add_node(AgentName.MULTI, run_multi)
    graph.add_node(AgentName.AUTO, route_to_agent)
    graph.add_conditional_edges(START, route_to_agent)
    for name in AgentName:
        graph.add_edge(name, END)
    return graph
