# agents/orchestrator_agent.py - The Router
# ------------------------------------------
# This is the ONLY agent the frontend talks to.
#
# Flow:
#   message  router_chain classifies intent -> delegate to right agent
#
# WHY two chains?
#   router_chain:  fast, no history, just classifies
#   general_chain: full history, handles casual chat when no specialist needed
#
# To add a new agent: import it and add one line to _ROUTES.

from typing import Literal
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_factory import make_llm, make_chain, make_tool_schema, run_plain_agent
from prompts.router_prompt import ROUTER_PROMPT
from prompts.orchestrator_prompt import SYSTEM_PROMPT

from agents import data_agent
from agents import mentor_agent

AGENT = "orchestrator"


# -- Router chain --------------------------------------------------------------

class RouteDecision(BaseModel):
    agent: Literal["task", "mentor", "tracker", "comms", "memory", "job", "resume", "mock", "general"]

ROUTER_TOOL_SCHEMA = make_tool_schema(
    name="RouteDecision",
    description="Classify the user message to the correct agent.",
    extra_properties={
        "agent": {
            "type": "string",
            "enum": ["task", "mentor", "tracker", "comms", "memory", "job", "resume", "mock", "general"],
            "description": "Which agent should handle this message.",
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


# -- Routing table -------------------------------------------------------------
# Add one line here when each new agent is built.

_ROUTES = {
    # task + tracker + memory are unified - data_agent handles all 3 in one call
    "task":    data_agent.run,
    "tracker": data_agent.run,
    "memory":  data_agent.run,
    "mentor":  mentor_agent.run,
    # "comms":   comms_agent.run,   <- future
    # "job":     job_agent.run,     <- future
    # "resume":  resume_agent.run,  <- future
    # "mock":    mock_agent.run,    <- future
}


# -- Public API ----------------------------------------------------------------

def run(user_id: str, message: str) -> dict:
    # Step 1: classify
    decision: RouteDecision = _router_chain.invoke({"input": message})

    # Step 2: delegate
    handler = _ROUTES.get(decision.agent)

    if handler:
        result = handler(user_id=user_id, message=message)
    else:
        result = run_plain_agent(user_id, AGENT, message, _general_chain, _general_llm)

    result["agent_used"] = decision.agent
    return result
