# Tracks LLM spend (tokens, cost in INR/USD), alerts when nearing budget
import os
from datetime import datetime, timedelta

from orbit.core.llm_client import get_llm_cost_usd, get_llm_usage
from orbit.utils.logger import get_logger

logger = get_logger("cost_agent")

MONTHLY_BUDGET_USD = float(os.getenv("COST_AGENT_BUDGET_USD", "50.0"))
ALERT_THRESHOLD = 0.8


class CostAgent:
    def run(self, request: str) -> str:
        if "spend" in request.lower() or "cost" in request.lower():
            return self._summarize_spend()
        if "budget" in request.lower():
            return self._check_budget()
        return self._summarize_spend()

    def _summarize_spend(self) -> str:
        usage = get_llm_usage()
        total_cost = usage.get("total_cost", 0.0)
        total_tokens = usage.get("total_tokens", 0)
        logger.info("Spending summary: %.2f INR, %d tokens", total_cost, total_tokens)
        return f"Session spend: ₹{total_cost:.2f} INR ({total_tokens} tokens)"

    def _check_budget(self) -> str:
        cost_usd = get_llm_cost_usd()
        pct = (cost_usd / MONTHLY_BUDGET_USD) * 100 if MONTHLY_BUDGET_USD > 0 else 0
        status = "OK" if pct < ALERT_THRESHOLD * 100 else "ALERT"
        logger.warning("Budget check: %.2f / %.2f USD (%.1f%%) - %s", cost_usd, MONTHLY_BUDGET_USD, pct, status)
        return f"Monthly: ${cost_usd:.2f} / ${MONTHLY_BUDGET_USD:.2f} ({pct:.1f}%) [{status}]"
