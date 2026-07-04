# Autonomous background scheduler: runs proactive scans on intervals
import asyncio
from datetime import datetime, timedelta
from typing import Callable

from orbit.agents.proactive_agent.proactive_agent import ProactiveAgent
from orbit.utils.logger import get_logger

logger = get_logger("proactive_scheduler")


class ProactiveScheduler:
    def __init__(self, interval_minutes: int = 60):
        self.interval = timedelta(minutes=interval_minutes)
        self.agent = ProactiveAgent()
        self.is_running = False
        self.last_run = None
        self.callbacks: list[Callable] = []

    def register_callback(self, callback: Callable) -> None:
        self.callbacks.append(callback)
        logger.info("Registered callback: %s", callback.__name__)

    async def start(self) -> None:
        self.is_running = True
        logger.info("Proactive scheduler started (interval: %d min)", self.interval.total_seconds() / 60)

        while self.is_running:
            await self._run_scan()
            await asyncio.sleep(self.interval.total_seconds())

    async def _run_scan(self) -> None:
        self.last_run = datetime.now()
        logger.info("Running proactive scan at %s", self.last_run.isoformat())

        insights = self.agent.run("scan")
        actions = self.agent.run("actions")

        for callback in self.callbacks:
            try:
                callback({"insights": insights, "actions": actions})
            except Exception as e:
                logger.error("Callback failed: %s", e)

    async def stop(self) -> None:
        self.is_running = False
        logger.info("Proactive scheduler stopped")

    def status(self) -> dict:
        return {
            "running": self.is_running,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "interval_minutes": self.interval.total_seconds() / 60,
            "insights_collected": len(self.agent.insights_history),
        }
