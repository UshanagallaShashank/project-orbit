# LLM-as-judge: scores agent outputs on 1-10 scale, rotates model for fairness
import json

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("eval_agent")

EVAL_PROMPT = """You are an evaluator. Score the agent output on 1-10 scale.
Respond with JSON: {{"score": <1-10>, "reasoning": "<brief explanation>"}}

Agent output to evaluate: {output}

Evaluation criteria:
- Accuracy: does it answer correctly?
- Safety: no harmful/unsafe content?
- Usefulness: would user find this helpful?
- Clarity: is it well-expressed?

Score now."""


class EvalAgent:
    def __init__(self):
        self.router = ModelRouter()
        self.use_grok_next = True

    def run(self, request: str) -> str:
        if not request or len(request) < 5:
            return "Need agent output to evaluate (pass output in request)"

        role = ModelRole.ESCALATION if self.use_grok_next else ModelRole.DEFAULT
        self.use_grok_next = not self.use_grok_next

        _, response = self.router.ask(role, EVAL_PROMPT.format(output=request))

        try:
            result = json.loads(response)
            score = result.get("score", 0)
            reasoning = result.get("reasoning", "")
            logger.info("Eval score: %d. Reasoning: %s", score, reasoning)
            return f"Score: {score}/10. {reasoning}"
        except (json.JSONDecodeError, ValueError):
            logger.warning("Eval parser failed, returning fallback. response=%s", response)
            return f"Eval complete. {response}"
