# Saves and lists expense rows in the Supabase expenses table
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
