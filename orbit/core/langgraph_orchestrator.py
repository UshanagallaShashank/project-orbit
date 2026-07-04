# Builds the LangGraph state machine that routes each request to the right agent
from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from orbit.agents.expense_agent.expense_agent import ExpenseAgent
from orbit.agents.learning_tracker.learning_tracker_agent import LearningTrackerAgent
from orbit.agents.memory_agent.memory_agent import MemoryAgent
from orbit.agents.resume_agent.resume_agent import ResumeAgent
from orbit.types.shared import AgentName


class OrbitState(TypedDict):
    request: str
    agent_name: str
    result: str


def run_learning_tracker(state: OrbitState) -> OrbitState:
    return {**state, "result": LearningTrackerAgent().run(state["request"])}


def run_expense(state: OrbitState) -> OrbitState:
    return {**state, "result": ExpenseAgent().run(state["request"])}


def run_resume(state: OrbitState) -> OrbitState:
    return {**state, "result": ResumeAgent().run(state["request"])}


def run_memory(state: OrbitState) -> OrbitState:
    return {**state, "result": MemoryAgent().run(state["request"])}


def route_to_agent(state: OrbitState) -> str:
    return state["agent_name"]


def build_orbit_graph() -> StateGraph[OrbitState]:
    graph: StateGraph[OrbitState] = StateGraph(OrbitState)
    graph.add_node(AgentName.LEARNING_TRACKER, run_learning_tracker)
    graph.add_node(AgentName.EXPENSE, run_expense)
    graph.add_node(AgentName.RESUME, run_resume)
    graph.add_node(AgentName.MEMORY, run_memory)
    graph.add_conditional_edges(START, route_to_agent)
    for name in AgentName:
        graph.add_edge(name, END)
    return graph
