# Tracks LeetCode problem-solving progress, recommends daily practice
import json

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("leetcode_agent")

RECOMMEND_PROMPT = """Based on solving {solved} LeetCode problems, recommend 4 problems today.
Focus on: {focus}

Respond with JSON: {{"problems": [{{"title": "...", "difficulty": "easy/medium/hard", "topic": "..."}}]}}

Recommend now."""


class LeetCodeAgent:
    def run(self, request: str) -> str:
        if "recommend" in request.lower():
            return self._recommend_daily()
        if "solved" in request.lower():
            return self._track_solve(request)
        return "LeetCode agent ready. Say 'recommend' for daily problems or 'solved X' to track."

    def _recommend_daily(self) -> str:
        _, response = ModelRouter().ask(
            ModelRole.DEFAULT,
            RECOMMEND_PROMPT.format(solved=42, focus="binary search, dynamic programming, graphs")
        )
        try:
            result = json.loads(response)
            problems = result.get("problems", [])
            logger.info("Recommended %d problems for today", len(problems))
            return json.dumps(problems, indent=2)
        except (json.JSONDecodeError, ValueError):
            logger.warning("Recommend parser failed. response=%s", response)
            return f"Recommendations: {response}"

    def _track_solve(self, request: str) -> str:
        logger.info("Tracking solve: %s", request)
        return f"Tracked. Keep grinding! {request}"
