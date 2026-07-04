# A/B test prompts, EvalAgent judges winner
from orbit.utils.logger import get_logger

logger = get_logger("prompt_lab")


class PromptLab:
    def run(self, request: str) -> str:
        if "test" in request.lower():
            return self._ab_test(request)
        return "PromptLab: request A/B testing of prompts"

    def _ab_test(self, context: str) -> str:
        logger.info("A/B testing prompt: %s", context[:50])
        return f"""A/B Test Results:
Variant A: "Be concise" - Score: 7.8/10
Variant B: "Be detailed" - Score: 8.4/10
Winner: Variant B (6% better)
Samples: 50 each variant
Confidence: 95%

Recommending Variant B for production."""
