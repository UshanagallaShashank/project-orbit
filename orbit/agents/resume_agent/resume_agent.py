# Saves a new resume version from text and confirms what was stored
from orbit.agents.resume_agent.resume_store import save_version
from orbit.utils.logger import get_logger

logger = get_logger("resume_agent")


class ResumeAgent:
    def run(self, request: str) -> str:
        logger.info("Received request: %s", request)
        version = save_version(label="untitled", content=request, note="")
        return f"Saved resume version {version['id']}"
