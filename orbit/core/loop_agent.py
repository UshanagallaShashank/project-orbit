# Retry + escalate on agent failure: tries default model, then fallback, then escalation
from typing import Callable

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("loop_agent")


def with_retry(agent_run: Callable[[str], str], max_attempts: int = 2) -> Callable[[str], str]:
    def wrapped(request: str) -> str:
        roles = [ModelRole.DEFAULT, ModelRole.FALLBACK, ModelRole.ESCALATION]
        for attempt, role in enumerate(roles[:max_attempts]):
            try:
                logger.info("Attempt %d with role %s", attempt + 1, role)
                result = agent_run(request)
                if result and len(result) > 0:
                    return result
            except Exception as e:
                logger.warning("Attempt %d failed: %s", attempt + 1, e)
        logger.error("All %d attempts failed for request: %s", max_attempts, request)
        return "All retry attempts exhausted. Agent unable to process request."

    return wrapped
