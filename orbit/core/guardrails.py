# Hard-blocks destructive operations no matter which agent requests them
from orbit.utils.logger import get_logger

logger = get_logger("guardrails")

BLOCKED_PATTERNS: list[str] = [
    "drop table",
    "delete from",
    "truncate",
    "force-push",
    "force push",
    "rm -rf",
]


def is_safe(action_text: str) -> bool:
    lowered = action_text.lower()
    for pattern in BLOCKED_PATTERNS:
        if pattern in lowered:
            logger.error("Blocked destructive action containing: %s", pattern)
            return False
    return True
