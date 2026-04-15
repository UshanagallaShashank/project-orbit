# agents/income_agent.py - Personal Finance Tracker Agent
# ---------------------------------------------------------
# Extracts income and expense entries from natural language,
# saves them to the income_entries table, and answers
# questions about spending/earnings (summaries, net balance).
#
# Follows the exact same factory pattern as data_agent.py:
#   fetch context -> build prompt -> chain.invoke -> save -> return
#
# WHY a separate agent and not part of data_agent?
#   Financial data has its own table, its own summary logic,
#   and its own prompt rules (amounts, categories, net calc).
#   Mixing it into data_agent would make that agent too broad.

from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_factory import (
    make_llm, make_chain, make_tool_schema, run_plain_agent,
)
from prompts.income_prompt import SYSTEM_PROMPT
from utils.history import get_history, save_messages
from utils.summarize import maybe_summarize
from config import supabase

AGENT = "income"


# -- Response model -----------------------------------------------------------

class IncomeEntry(BaseModel):
    type:        str   # "income" | "expense"
    amount:      float
    category:    str
    description: str = ""
    entry_date:  str  = ""   # YYYY-MM-DD


class IncomeAgentResponse(BaseModel):
    reply:   str
    entries: list[IncomeEntry] = Field(default_factory=list)


# -- Tool schema --------------------------------------------------------------

TOOL_SCHEMA = make_tool_schema(
    name="IncomeAgentResponse",
    description="Extract income/expense entries from the user message and reply.",
    extra_properties={
        "entries": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type":        {"type": "string", "enum": ["income", "expense"]},
                    "amount":      {"type": "number", "description": "Always positive."},
                    "category":    {"type": "string"},
                    "description": {"type": "string"},
                    "entry_date":  {"type": "string", "description": "YYYY-MM-DD"},
                },
                "required": ["type", "amount", "category"],
            },
            "description": "Transactions extracted from the user message.",
        }
    },
)

llm = make_llm()


# -- DB helpers ---------------------------------------------------------------

def _save_entries(user_id: str, entries: list[IncomeEntry]) -> None:
    """Insert extracted transactions into income_entries table."""
    if not entries:
        return
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    rows = [
        {
            "user_id":     user_id,
            "type":        e.type,
            "amount":      e.amount,
            "category":    e.category,
            "description": e.description,
            "entry_date":  e.entry_date or today,
        }
        for e in entries
    ]
    supabase.table("income_entries").insert(rows).execute()


def _fetch_monthly_summary(user_id: str) -> str:
    """
    Pull this month's entries from Supabase and build a summary string
    that gets injected into the prompt so the LLM can answer
    "show my summary" without doing any math itself.

    WHY inject it instead of letting the LLM query the DB?
      LLMs can't query databases. We fetch the data in Python,
      format it as text, and give it to the LLM as context.
      This is the standard pattern for giving LLMs live data.
    """
    now   = datetime.now(timezone.utc)
    start = now.strftime("%Y-%m-01")   # first day of current month

    res = (
        supabase.table("income_entries")
        .select("type, amount, category, description, entry_date")
        .eq("user_id", user_id)
        .gte("entry_date", start)
        .order("entry_date", desc=False)
        .execute()
    )
    if not res.data:
        return ""

    total_income   = sum(r["amount"] for r in res.data if r["type"] == "income")
    total_expenses = sum(r["amount"] for r in res.data if r["type"] == "expense")
    net            = total_income - total_expenses

    # Category breakdown for expenses
    cat_totals: dict[str, float] = {}
    for r in res.data:
        if r["type"] == "expense":
            cat = r.get("category", "other")
            cat_totals[cat] = cat_totals.get(cat, 0) + r["amount"]

    lines = [
        f"Month: {now.strftime('%B %Y')}",
        f"Total income:   +{total_income:.0f}",
        f"Total expenses: -{total_expenses:.0f}",
        f"Net:            {'+' if net >= 0 else ''}{net:.0f}",
    ]
    if cat_totals:
        top = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:5]
        lines.append("Expense breakdown: " + ", ".join(f"{c} {v:.0f}" for c, v in top))

    return "\n".join(lines)


def _is_summary_request(message: str) -> bool:
    """Check if the user is asking for a summary rather than logging a transaction."""
    keywords = [
        "summary", "report", "balance", "how much", "total",
        "spent this month", "earned this month", "net", "overview",
    ]
    msg = message.lower()
    return any(k in msg for k in keywords)


# -- Public API ---------------------------------------------------------------

def run(user_id: str, message: str) -> dict:
    # Inject monthly data into prompt when the user asks for a summary
    if _is_summary_request(message):
        monthly_data = _fetch_monthly_summary(user_id)
        context_block = (
            f"\n\n[MONTHLY DATA:\n{monthly_data}\n]"
            if monthly_data
            else "\n\n[MONTHLY DATA: No entries recorded yet.]"
        )
    else:
        context_block = ""

    system = SYSTEM_PROMPT + context_block

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        MessagesPlaceholder("history"),
        ("human", "{input}"),
    ])
    chain = make_chain(prompt, llm, IncomeAgentResponse, TOOL_SCHEMA)

    history, count = get_history(user_id, AGENT)
    result: IncomeAgentResponse | None = chain.invoke({"history": history, "input": message})

    if result is None:
        return run_plain_agent(user_id, AGENT, message, prompt | llm, llm)

    _save_entries(user_id, result.entries)

    save_messages(user_id, AGENT, message, result.reply)
    maybe_summarize(user_id, AGENT, count + 1, llm)

    return {
        "reply":   result.reply,
        "entries": [e.model_dump() for e in result.entries],
    }
