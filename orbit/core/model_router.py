# Routes each task to the cheapest capable model, with Gemini as automatic fallback
import httpx

from orbit.core.llm_client import complete
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("model_router")

MODEL_MAP: dict[ModelRole, str] = {
    ModelRole.DEFAULT: "gemini-2.5-flash-lite",
    ModelRole.FALLBACK: "grok-4-1-fast",
    ModelRole.CODING: "grok-code-fast-1",
    ModelRole.ESCALATION: "gemini-2.5-pro",
}


class ModelRouter:
    def pick(self, role: ModelRole) -> str:
        model = MODEL_MAP[role]
        logger.info("Picked model %s for role %s", model, role)
        return model

    def fallback_for(self, failed_model: str) -> str:
        fallback = MODEL_MAP[ModelRole.FALLBACK]
        if failed_model == fallback:
            fallback = MODEL_MAP[ModelRole.DEFAULT]
        logger.warning("Model %s failed, falling back to %s", failed_model, fallback)
        return fallback

    def ask(self, role: ModelRole, prompt: str) -> tuple[str, str]:
        model = self.pick(role)
        try:
            return model, complete(model, prompt)
        except httpx.HTTPError:
            fallback = self.fallback_for(model)
            return fallback, complete(fallback, prompt)
