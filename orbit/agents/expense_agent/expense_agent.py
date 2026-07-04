# Logs expenses by voice or manual entry and rolls them up against the monthly budget
from orbit.utils.logger import get_logger

logger = get_logger("expense_agent")


class ExpenseAgent:
    def run(self, request: str) -> str:
        logger.info("Received request: %s", request)
        return "ExpenseAgent stub - voice and manual logging lands in phase 3"
