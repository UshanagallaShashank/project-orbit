# Sums the current month's spending and compares it against the monthly budget
from datetime import datetime, timezone

from orbit.agents.expense_agent.expense_store import list_expenses

MONTHLY_BUDGET_INR = 75000.0


def month_summary() -> dict[str, float]:
    month_prefix = datetime.now(timezone.utc).strftime("%Y-%m")
    rows = list_expenses(limit=1000)
    spent = sum(
        float(str(row["amount"])) for row in rows if str(row["created_at"]).startswith(month_prefix)
    )
    return {"spent": spent, "budget": MONTHLY_BUDGET_INR, "remaining": MONTHLY_BUDGET_INR - spent}
