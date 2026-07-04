# Brainstorms project ideas tied to open problems
import json

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("idea_agent")

IDEA_PROMPT = """You are a startup idea generator. Given open problems, suggest 1-3 specific project ideas.
Respond with JSON: {{"ideas": [{{"title": "...", "description": "...", "problem": "..."}}]}}

Open problems: {problems}

Generate now."""


class IdeaAgent:
    def run(self, request: str) -> str:
        if not request or len(request) < 5:
            return "Describe a problem or area to brainstorm ideas for"

        _, response = ModelRouter().ask(ModelRole.ESCALATION, IDEA_PROMPT.format(problems=request))

        try:
            result = json.loads(response)
            ideas = result.get("ideas", [])
            logger.info("Generated %d ideas", len(ideas))
            return json.dumps(ideas, indent=2)
        except (json.JSONDecodeError, ValueError):
            logger.warning("Idea parser failed. response=%s", response)
            return f"Ideas: {response}"
