# Code generation + PR (gated by SandboxAgent)
from orbit.utils.logger import get_logger

logger = get_logger("feature_agent")


class FeatureAgent:
    def run(self, request: str) -> str:
        if "propose" in request.lower() or "idea" in request.lower():
            return self._propose_feature(request)
        return "FeatureAgent: describe a feature idea to propose"

    def _propose_feature(self, context: str) -> str:
        logger.info("Proposing feature: %s", context[:50])
        return f"""Proposed feature:
Feature: {context}
Branch: feature/proposed-{hash(context)%1000}
Status: Awaiting SandboxAgent test + review
Note: Will NOT auto-merge. Requires manual review."""
