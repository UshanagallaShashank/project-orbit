# agents/mentor_agent.py - Mentor Agent
# --------------------------------------
# UNIQUE to this agent:
#   - Uses gemini-2.5-flash (not lite) - better reasoning for coaching advice
#   - Plain text reply - no structured output, no DB save beyond message history
#
# WHY no structured output?
#   Mentor answers are long-form coaching. There's nothing to extract into a
#   structured field - the value IS the reply. Using run_plain_agent keeps it simple.

from prompts.mentor_prompt import SYSTEM_PROMPT
from agents.agent_factory import make_llm, make_prompt, run_plain_agent

AGENT = "mentor"

# Better model - mentor needs reasoning, not just speed
llm    = make_llm(model="gemini-2.5-flash")
prompt = make_prompt(SYSTEM_PROMPT)
chain  = prompt | llm


def run(user_id: str, message: str) -> dict:
    return run_plain_agent(user_id, AGENT, message, chain, llm)
