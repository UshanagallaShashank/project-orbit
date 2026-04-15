# agents/orchestrator_agent.py - The Router
# ------------------------------------------
# This is the ONLY agent the frontend talks to.
#
# Flow:
#   message -> router_chain classifies intent -> list of agents
#   -> run each agent -> merge all results into one response
#
# WHY multiple agents?
#   A single message can span multiple intents:
#   "find me jobs based on my resume" -> resume reads the file, job searches
#   "log my session and add a task" -> tracker logs, task saves
#   The router returns a list; all matching agents run and their output merges.
#
# To add a new agent: import it and add one line to _ROUTES.

from typing import List, Literal
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_factory import make_llm, make_chain, make_tool_schema, run_plain_agent
from prompts.router_prompt import ROUTER_PROMPT
from prompts.orchestrator_prompt import SYSTEM_PROMPT

AGENT = "orchestrator"

AgentName = Literal["task", "mentor", "tracker", "memory", "job", "resume", "mock", "income", "general"]


# -- Router chain --------------------------------------------------------------

class RouteDecision(BaseModel):
    agents: List[str]


ROUTER_TOOL_SCHEMA = make_tool_schema(
    name="RouteDecision",
    description="Classify the user message to one or more agents.",
    extra_properties={
        "agents": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["task", "mentor", "tracker", "memory", "job", "resume", "mock", "income", "general"],
            },
            "description": "List of agents that should handle this message (1-3 items).",
        }
    },
)

# Router doesn't need message history - just the current message
_router_llm    = make_llm()
_router_prompt = ChatPromptTemplate.from_messages([
    ("system", ROUTER_PROMPT),
    ("human", "{input}"),
])
_router_chain = make_chain(_router_prompt, _router_llm, RouteDecision, ROUTER_TOOL_SCHEMA)


# -- General chat chain --------------------------------------------------------

_general_llm    = make_llm()
_general_prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder("history"),
    ("human", "{input}"),
])
_general_chain = _general_prompt | _general_llm


# -- Context builder -----------------------------------------------------------

def _build_agent_context(results: list[dict]) -> str:
    """
    Build a short context string from completed agent results.
    Passed to subsequent agents so they know what earlier agents found.

    Example: resume ran first, extracted skills -> job agent gets them in context
    instead of re-reading the resume.
    """
    lines = []
    for r in results:
        agent = r.get("agent_used", "")
        if agent == "resume":
            skills = r.get("skills", [])
            roles  = r.get("roles", [])
            if skills:
                lines.append(f"Resume skills: {', '.join(skills[:8])}")
            if roles:
                lines.append(f"Target roles: {', '.join(roles[:3])}")
        elif agent == "job":
            jobs = r.get("jobs", [])
            if jobs:
                lines.append(f"Top job match: {jobs[0].get('title', '')} at {jobs[0].get('company', '')}")
        elif agent in ("task", "tracker", "memory", "data"):
            tasks    = r.get("tasks", [])
            entries  = r.get("entries", [])
            memories = r.get("memories", [])
            if tasks:
                lines.append(f"Tasks added: {', '.join(tasks[:3])}")
            if entries:
                names = [e.get("topic", e) if isinstance(e, dict) else str(e) for e in entries[:3]]
                lines.append(f"Progress logged: {', '.join(names)}")
            if memories:
                lines.append(f"Saved: {', '.join(memories[:2])}")
        elif agent == "income":
            reply_snippet = r.get("reply", "")[:80]
            if reply_snippet:
                lines.append(f"Income summary: {reply_snippet}")
    return "\n".join(lines)


# -- Routing table -------------------------------------------------------------
# Add one line here when each new agent is built.
# Import lazily inside run() to avoid circular imports at module load.

def _get_routes():
    from agents import data_agent, mentor_agent
    routes = {
        # task + tracker + memory are unified - data_agent handles all 3 in one call
        "task":    data_agent.run,
        "tracker": data_agent.run,
        "memory":  data_agent.run,
        "mentor":  mentor_agent.run,
    }
    # Import optional agents only if available
    try:
        from agents import resume_agent
        routes["resume"] = resume_agent.run
    except ImportError:
        pass
    try:
        from agents import job_agent
        routes["job"] = job_agent.run
    except ImportError:
        pass
    try:
        from agents import income_agent
        routes["income"] = income_agent.run
    except ImportError:
        pass
    return routes


# -- Result merger -------------------------------------------------------------

def _merge_results(results: list[dict]) -> dict:
    """
    Merge multiple agent results into one response.

    - reply:    join all non-empty replies with blank line between them
    - lists:    union all tasks/entries/memories/jobs
    - agents_used: collect all agent names
    """
    if not results:
        return {"reply": "I'm not sure how to handle that. Could you rephrase?", "agents_used": []}

    if len(results) == 1:
        return results[0]

    replies      = [r["reply"] for r in results if r.get("reply")]
    tasks        = []
    entries      = []
    memories     = []
    jobs         = []
    agents_used  = []

    for r in results:
        tasks.extend(r.get("tasks", []))
        entries.extend(r.get("entries", []))
        memories.extend(r.get("memories", []))
        jobs.extend(r.get("jobs", []))
        agent = r.get("agent_used") or r.get("agents_used")
        if isinstance(agent, list):
            agents_used.extend(agent)
        elif agent:
            agents_used.append(agent)

    merged: dict = {"reply": "\n\n".join(replies)}
    if tasks:
        merged["tasks"] = tasks
    if entries:
        merged["entries"] = entries
    if memories:
        merged["memories"] = memories
    if jobs:
        merged["jobs"] = jobs
    if agents_used:
        merged["agents_used"] = agents_used

    return merged


# -- Public API ----------------------------------------------------------------

def run(user_id: str, message: str) -> dict:
    # Step 1: classify -> list of agent names
    try:
        decision: RouteDecision = _router_chain.invoke({"input": message})
        agent_names = decision.agents if decision.agents else ["general"]
    except Exception:
        agent_names = ["general"]

    # Deduplicate while preserving order, collapse data subtypes to one data_agent call
    seen = set()
    unique_agents = []
    for name in agent_names:
        # task/tracker/memory all map to data_agent - only run it once
        key = "data" if name in ("task", "tracker", "memory") else name
        if key not in seen:
            seen.add(key)
            unique_agents.append(name)

    routes = _get_routes()
    results = []
    resume_profile: dict | None = None  # shared between resume -> job when both run

    for name in unique_agents:
        handler = routes.get(name)
        if handler:
            try:
                # Build context from agents that have already run this turn
                prior_context = _build_agent_context(results)

                # Pass prior context by appending to the message so downstream
                # agents (mentor, job) know what earlier agents found
                enriched_message = (
                    message + f"\n\n[Context from this session:\n{prior_context}]"
                    if prior_context else message
                )

                # If job_agent runs after resume_agent, pass the extracted profile
                # so job_agent doesn't need to re-read the resume
                if name == "job" and resume_profile is not None:
                    result = handler(user_id=user_id, message=enriched_message, _resume_profile=resume_profile)
                else:
                    result = handler(user_id=user_id, message=enriched_message)

                # Capture resume profile for downstream agents
                if name == "resume" and "_resume_profile" in result:
                    resume_profile = result.pop("_resume_profile")

                result["agent_used"] = name
                results.append(result)
            except Exception as e:
                # Don't let one failing agent kill the whole response
                results.append({"reply": f"({name} agent encountered an error: {e})", "agent_used": name})
        elif name == "general" or name not in routes:
            result = run_plain_agent(user_id, AGENT, message, _general_chain, _general_llm)
            result["agent_used"] = "general"
            results.append(result)

    merged = _merge_results(results)

    # Normalize agents_used to always be a list
    if "agents_used" not in merged:
        merged["agents_used"] = [r.get("agent_used", "general") for r in results]

    # Keep backward-compat single agent_used field
    merged["agent_used"] = merged["agents_used"][0] if merged["agents_used"] else "general"

    return merged
