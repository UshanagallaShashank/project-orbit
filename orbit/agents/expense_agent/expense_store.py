# Full CRUD plus search for expense rows in the Supabase expenses table
from orbit.utils.db import get_db


def save_expense(amount: float, category: str, note: str) -> dict[str, object]:
    row = {"amount": amount, "category": category, "note": note}
    result = get_db().table("expenses").insert(row).execute()
    return dict(result.data[0])


def list_expenses(limit: int = 100) -> list[dict[str, object]]:
    result = (
        get_db().table("expenses").select("*").order("created_at", desc=True).limit(limit).execute()
    )
    return [dict(row) for row in result.data]


def get_expense(expense_id: int) -> dict[str, object]:
    result = get_db().table("expenses").select("*").eq("id", expense_id).single().execute()
    return dict(result.data)


def update_expense(expense_id: int, amount: float, category: str, note: str) -> dict[str, object]:
    row = {"amount": amount, "category": category, "note": note}
    result = get_db().table("expenses").update(row).eq("id", expense_id).execute()
    return dict(result.data[0])


def delete_expense(expense_id: int) -> None:
    get_db().table("expenses").delete().eq("id", expense_id).execute()


def search_expenses(
    q: str = "", category: str = "", start: str = "", end: str = ""
) -> list[dict[str, object]]:
    query = get_db().table("expenses").select("*")
    if q:
        query = query.ilike("note", f"%{q}%")
    if category:
        query = query.eq("category", category)
    if start:
        query = query.gte("created_at", start)
    if end:
        query = query.lte("created_at", end)
    result = query.order("created_at", desc=True).execute()
    return [dict(row) for row in result.data]
