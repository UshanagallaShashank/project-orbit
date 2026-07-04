# Daily task scheduler from Google Calendar, priority ranking
from datetime import datetime, timedelta

from orbit.utils.logger import get_logger

logger = get_logger("task_agent")

MOCK_EVENTS = [
    {"title": "Code Project Orbit", "due": (datetime.now() + timedelta(hours=2)).isoformat(), "priority": 10},
    {"title": "LeetCode daily 4 problems", "due": (datetime.now() + timedelta(hours=4)).isoformat(), "priority": 8},
    {"title": "Standup with team", "due": (datetime.now() + timedelta(hours=1)).isoformat(), "priority": 7},
    {"title": "Review pull requests", "due": (datetime.now() + timedelta(hours=6)).isoformat(), "priority": 6},
]


class TaskAgent:
    def run(self, request: str) -> str:
        if "today" in request.lower() or "schedule" in request.lower():
            return self._daily_schedule()
        if "priority" in request.lower():
            return self._ranked_tasks()
        return self._daily_schedule()

    def _daily_schedule(self) -> str:
        sorted_tasks = sorted(MOCK_EVENTS, key=lambda t: t["priority"], reverse=True)
        logger.info("Daily tasks: %d items", len(sorted_tasks))
        tasks_str = "\n".join(f"• {t['title']} (Priority: {t['priority']}/10)" for t in sorted_tasks[:5])
        return f"Today's schedule:\n{tasks_str}"

    def _ranked_tasks(self) -> str:
        high_priority = [t for t in MOCK_EVENTS if t["priority"] >= 8]
        logger.info("High-priority tasks: %d", len(high_priority))
        return f"High priority ({len(high_priority)}) tasks: {', '.join(t['title'] for t in high_priority)}"
