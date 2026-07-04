# Parses free-text expense descriptions into structured amount, category, and note
import json

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole

PARSE_PROMPT = """You are an expense parser. Extract the expense from the user's text.
Respond with only a JSON object, no other text, in this exact shape:
{"amount": <number in INR>, "category": "<one of: food, transport, rent, shopping, health, entertainment, other>", "note": "<short description>"}

Example input: spent 250 on lunch at the mess
Example output: {"amount": 250, "category": "food", "note": "lunch at the mess"}

Never invent an amount. If no amount is present, use 0.

Input: """


def parse_expense(text: str) -> dict[str, object]:
    _, answer = ModelRouter().ask(ModelRole.DEFAULT, PARSE_PROMPT + text)
    cleaned = answer.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
    parsed: dict[str, object] = json.loads(cleaned.strip())
    return parsed
