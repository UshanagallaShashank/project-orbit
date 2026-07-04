# Routes for full expense CRUD, search, and the monthly budget summary
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from orbit.agents.expense_agent.expense_rollup import month_summary
from orbit.agents.expense_agent.expense_store import (
    delete_expense,
    list_expenses,
    save_expense,
    search_expenses,
    update_expense,
)

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


@expense_router.get("/expenses/search")
def search(q: str = "", category: str = "", start: str = "", end: str = "") -> list[dict[str, object]]:
    return search_expenses(q, category, start, end)


@expense_router.get("/expenses/summary")
def get_summary() -> dict[str, float]:
    return month_summary()


@expense_router.put("/expenses/{expense_id}")
def edit_expense(expense_id: int, body: ExpenseEntry) -> dict[str, object]:
    try:
        return update_expense(expense_id, body.amount, body.category, body.note)
    except IndexError as error:
        raise HTTPException(status_code=404, detail="Expense not found") from error


@expense_router.delete("/expenses/{expense_id}")
def remove_expense(expense_id: int) -> dict[str, bool]:
    delete_expense(expense_id)
    return {"deleted": True}
