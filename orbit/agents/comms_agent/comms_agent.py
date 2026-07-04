# Drafts tailored emails (never sends): recruiter outreach, follow-ups
from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("comms_agent")

EMAIL_PROMPT = """Draft a professional email for: {context}
Subject should be concise. Never auto-send—this is draft-only for review.

Format:
Subject: ...
To: ...

Body:
..."""


class CommsAgent:
    def run(self, request: str) -> str:
        if "recruiter" in request.lower() or "email" in request.lower():
            return self._draft_recruiter_email(request)
        return "CommsAgent: Say 'draft recruiter email' or describe email context"

    def _draft_recruiter_email(self, context: str) -> str:
        _, response = ModelRouter().ask(ModelRole.DEFAULT, EMAIL_PROMPT.format(context=context))
        logger.info("Drafted email from CommsAgent (draft-only, never auto-sent)")
        return f"📧 DRAFT EMAIL (for your review, never auto-sent):\n\n{response}"
