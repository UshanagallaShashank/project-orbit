# Stores a piece of long-term context and confirms what was saved
from orbit.agents.memory_agent.memory_store import save_memory
from orbit.utils.logger import get_logger

logger = get_logger("memory_agent")


class MemoryAgent:
    def run(self, request: str) -> str:
        logger.info("Received request: %s", request)
        memory = save_memory(content=request, tag="general")
        return f"Remembered: {memory['content']}"
