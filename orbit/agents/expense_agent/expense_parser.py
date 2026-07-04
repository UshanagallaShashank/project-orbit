# Parses free-text expense descriptions into structured amount, category, and note
import json

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("expense_parser")

PARSE_PROMPT = """You are an expense parser. Extract the expense from the user's text.
Respond with only a JSON object, no other text, in this exact shape:
{"amount": <number in INR>, "category": "<a short lowercase label such as food, transport, rent, shopping, health, entertainment - invent a fitting one like 'ai tools' when none match>", "note": "<short description>"}

All amounts are in INR. If the user does not specify a currency, assume INR. Do not convert between currencies.

Example input: spent 250 on lunch at the mess
Example output: {"amount": 250, "category": "food", "note": "lunch at the mess"}

Never invent an amount. If no amount is present, use 0.

Input: """


def parse_expense(text: str) -> dict[str, object]:
    _, answer = ModelRouter().ask(ModelRole.DEFAULT, PARSE_PROMPT + text)
    cleaned = answer.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
    raw = cleaned.strip()
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError, ValueError):
        logger.warning("Expense parser failed to decode model output, returning fallback. output=%s", raw)
        return {"amount": 0, "category": "other", "note": ""}
    if not isinstance(parsed, dict):
        logger.warning("Expense parser output was not a JSON object, returning fallback. output=%s", raw)
        return {"amount": 0, "category": "other", "note": ""}
    return parsed
