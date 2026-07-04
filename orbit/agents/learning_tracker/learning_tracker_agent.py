# Logs study progress from natural language and confirms what was saved
from orbit.agents.learning_tracker.learning_store import save_entry
from orbit.utils.logger import get_logger

logger = get_logger("learning_tracker")


class LearningTrackerAgent:
    def run(self, request: str) -> str:
        logger.info("Received request: %s", request)
        entry = save_entry(track="dsa", topic=request, status="in_progress", note="")
        return f"Logged progress under {entry['track']}: {entry['topic']}"
