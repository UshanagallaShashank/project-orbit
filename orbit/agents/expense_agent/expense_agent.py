# Logs expenses from natural language text and confirms what was saved
from orbit.agents.expense_agent.expense_parser import parse_expense
from orbit.agents.expense_agent.expense_store import save_expense
from orbit.utils.logger import get_logger

logger = get_logger("expense_agent")


class ExpenseAgent:
    def run(self, request: str) -> str:
        parsed = parse_expense(request)
        amount = float(str(parsed["amount"]))
        category = str(parsed["category"])
        note = str(parsed["note"])
        if amount <= 0:
            return "Could not find an amount in that - try something like: spent 250 on lunch"
        save_expense(amount, category, note)
        logger.info("Logged %.2f INR under %s", amount, category)
        return f"Logged {amount:.0f} INR under {category}: {note}"
