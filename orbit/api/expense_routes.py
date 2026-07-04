# Routes for manual expense entry, listing, and the monthly budget summary
from fastapi import APIRouter
from pydantic import BaseModel, Field

from orbit.agents.expense_agent.expense_rollup import month_summary
from orbit.agents.expense_agent.expense_store import list_expenses, save_expense

expense_router = APIRouter()


class ExpenseEntry(BaseModel):
    amount: float = Field(gt=0)
    category: str
    note: str = ""


@expense_router.post("/expenses")
def add_expense(body: ExpenseEntry) -> dict[str, object]:
    return save_expense(body.amount, body.category, body.note)


@expense_router.get("/expenses")
def get_expenses() -> list[dict[str, object]]:
    return list_expenses()


@expense_router.get("/expenses/summary")
def get_summary() -> dict[str, float]:
    return month_summary()
