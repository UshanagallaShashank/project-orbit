# Stores and recalls long-term context for all agents via Supabase and pgvector
from orbit.utils.logger import get_logger

logger = get_logger("memory_agent")


class MemoryAgent:
    def run(self, request: str) -> str:
        logger.info("Received request: %s", request)
        return "MemoryAgent stub - pgvector memory lands in phase 6"
