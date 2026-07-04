# Proactive multi-agent orchestrator: monitors, predicts, acts autonomously
import json
from datetime import datetime, timedelta

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("proactive_agent")

MONITORING_PROMPT = """You are a proactive assistant monitoring user data. Analyze and identify:
1. Risks: budget overspend, project staleness, learning gaps
2. Opportunities: cost savings, productivity gains, skill development
3. Urgent actions: immediate follow-ups, approvals needed

Data snapshot:
{data_snapshot}

Respond with JSON: {{"risks": [...], "opportunities": [...], "urgent_actions": [...], "recommendation": "..."}}"""

ACTION_PROMPT = """Based on this insight: {insight}

Generate a specific action for the user:
- What to do
- Why it matters
- Who/what it involves
- Expected outcome

Respond with JSON: {{"action": "...", "reason": "...", "impact": "...", "priority": 1-10}}"""


class ProactiveAgent:
    def __init__(self):
        self.router = ModelRouter()
        self.last_scan = None
        self.insights_history = []

    def run(self, request: str = "") -> str:
        if "scan" in request.lower():
            return self._scan_and_monitor()
        if "actions" in request.lower():
            return self._suggest_actions()
        if "report" in request.lower():
            return self._generate_report()
        return self._scan_and_monitor()

    def _scan_and_monitor(self) -> str:
        logger.info("Proactive scan: analyzing user data patterns...")

        data_snapshot = {
            "expenses": {"month_spent": 12500, "budget": 75000, "remaining": 62500, "trend": "stable"},
            "learning": {"active_tracks": 4, "completed_this_month": 3, "streak": 14, "stale_since": 2},
            "projects": {"active": 5, "stale": 2, "at_risk": 1, "last_updated": "3 days ago"},
            "jobs": {"pending_review": 3, "applied": 8, "interviews": 2, "approvals_pending": 3},
            "health": {"email_drafts": 2, "tasks_overdue": 1, "repos_needing_updates": 2},
        }

        _, insights = self.router.ask(
            ModelRole.ESCALATION,
            MONITORING_PROMPT.format(data_snapshot=json.dumps(data_snapshot))
        )

        try:
            result = json.loads(insights)
            self.insights_history.append({
                "timestamp": datetime.now().isoformat(),
                "insights": result
            })
            logger.info("Found %d risks, %d opportunities, %d urgent actions",
                       len(result.get("risks", [])),
                       len(result.get("opportunities", [])),
                       len(result.get("urgent_actions", [])))
            return json.dumps(result, indent=2)
        except (json.JSONDecodeError, ValueError):
            logger.warning("Insights parse failed. raw response: %s", insights)
            return f"Scan complete:\n{insights}"

    def _suggest_actions(self) -> str:
        if not self.insights_history:
            return "No insights yet. Run 'scan' first."

        latest = self.insights_history[-1]["insights"]
        urgent = latest.get("urgent_actions", [])[:3]

        actions = []
        for action_text in urgent:
            _, action_plan = self.router.ask(
                ModelRole.DEFAULT,
                ACTION_PROMPT.format(insight=action_text)
            )
            try:
                action_obj = json.loads(action_plan)
                actions.append(action_obj)
            except (json.JSONDecodeError, ValueError):
                actions.append({"action": action_text, "reason": "Auto-flagged", "priority": 8})

        logger.info("Generated %d proactive actions", len(actions))
        return json.dumps(actions, indent=2)

    def _generate_report(self) -> str:
        if not self.insights_history:
            return "No data collected yet."

        summary = {
            "scans_completed": len(self.insights_history),
            "last_scan": self.insights_history[-1]["timestamp"],
            "total_risks_identified": sum(
                len(i["insights"].get("risks", [])) for i in self.insights_history
            ),
            "total_opportunities": sum(
                len(i["insights"].get("opportunities", [])) for i in self.insights_history
            ),
            "recommendation": "Review urgent actions, prioritize by impact"
        }
        logger.info("Generated proactive monitoring report")
        return json.dumps(summary, indent=2)
