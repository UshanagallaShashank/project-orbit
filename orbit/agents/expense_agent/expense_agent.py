# Logs expenses from natural language text and confirms what was saved
import json

from orbit.agents.expense_agent.expense_parser import parse_expense
from orbit.agents.expense_agent.expense_store import save_expense
from orbit.utils.logger import get_logger

logger = get_logger("expense_agent")


class ExpenseAgent:
    def run(self, request: str) -> str:
        normalized = request.strip().lower()
        if any(phrase in normalized for phrase in ["balance", "remaining", "how much left", "check my balance"]):
            return "I can help with expenses, but balance checking is handled elsewhere. Try logging an expense like: spent 250 on lunch"

        try:
            parsed = parse_expense(request)
            amount = float(str(parsed.get("amount", 0)))
            category = str(parsed.get("category", "other"))
            note = str(parsed.get("note", ""))
        except (json.JSONDecodeError, ValueError, TypeError, KeyError):
            return "Could not find an amount in that - try something like: spent 250 on lunch"
        if amount <= 0:
            return "Could not find an amount in that - try something like: spent 250 on lunch"
        save_expense(amount, category, note)
        logger.info("Logged %.2f INR under %s", amount, category)
        return f"Logged {amount:.0f} INR under {category}: {note}"
