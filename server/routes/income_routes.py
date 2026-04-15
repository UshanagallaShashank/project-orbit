# routes/income_routes.py - Income and expense data endpoints
# ------------------------------------------------------------
# GET  /api/income              - list all entries (optional ?month=YYYY-MM)
# GET  /api/income/summary      - totals for the current month
# DELETE /api/income/{id}       - delete a single entry
#
# The agent writes directly to income_entries via income_agent._save_entries().
# These routes are for the frontend to READ and DISPLAY the saved data.

from fastapi import APIRouter, Depends
from datetime import datetime, timezone

from config import supabase
from middleware import get_current_user

router = APIRouter()


@router.get("")
def list_entries(month: str = "", user=Depends(get_current_user)):
    """
    List income/expense entries.
    Optional query param: ?month=YYYY-MM  (defaults to current month)
    """
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")

    start = f"{month}-01"
    # Last day: just filter by month prefix using gte/lt
    year, mon = month.split("-")
    next_mon  = int(mon) + 1
    next_year = int(year)
    if next_mon > 12:
        next_mon  = 1
        next_year += 1
    end = f"{next_year}-{next_mon:02d}-01"

    res = (
        supabase.table("income_entries")
        .select("id, type, amount, category, description, entry_date, created_at")
        .eq("user_id", user["id"])
        .gte("entry_date", start)
        .lt("entry_date", end)
        .order("entry_date", desc=True)
        .execute()
    )
    return res.data


@router.get("/summary")
def monthly_summary(month: str = "", user=Depends(get_current_user)):
    """
    Returns totals for the requested month.
    Response: { month, income, expenses, net, by_category: {cat: amount} }
    """
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")

    start = f"{month}-01"
    year, mon = month.split("-")
    next_mon  = int(mon) + 1
    next_year = int(year)
    if next_mon > 12:
        next_mon  = 1
        next_year += 1
    end = f"{next_year}-{next_mon:02d}-01"

    res = (
        supabase.table("income_entries")
        .select("type, amount, category")
        .eq("user_id", user["id"])
        .gte("entry_date", start)
        .lt("entry_date", end)
        .execute()
    )
    rows = res.data or []

    total_income   = sum(r["amount"] for r in rows if r["type"] == "income")
    total_expenses = sum(r["amount"] for r in rows if r["type"] == "expense")

    by_category: dict[str, float] = {}
    for r in rows:
        cat = r.get("category", "other")
        by_category[cat] = by_category.get(cat, 0) + r["amount"]

    return {
        "month":       month,
        "income":      total_income,
        "expenses":    total_expenses,
        "net":         total_income - total_expenses,
        "by_category": by_category,
    }


@router.delete("/{entry_id}")
def delete_entry(entry_id: str, user=Depends(get_current_user)):
    supabase.table("income_entries").delete().eq("id", entry_id).eq("user_id", user["id"]).execute()
    return {"deleted": entry_id}
