# Hard-blocks destructive operations + PII leakage + secret exposure
import re

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

PII_PATTERNS: dict[str, str] = {
    "ssn": r"\d{3}-\d{2}-\d{4}",
    "credit_card": r"\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}",
    "phone": r"\+?1?\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}",
}

SECRET_PATTERNS: dict[str, str] = {
    "api_key": r"(api_key|apikey|api-key)\s*=\s*['\"]?[a-zA-Z0-9_-]+",
    "private_key": r"-----BEGIN (RSA |ED25519 )?PRIVATE KEY-----",
    "token": r"(token|auth|bearer)\s*=\s*['\"]?[a-zA-Z0-9_-]+",
}


def is_safe(action_text: str) -> bool:
    lowered = action_text.lower()
    for pattern in BLOCKED_PATTERNS:
        if pattern in lowered:
            logger.error("Blocked destructive action containing: %s", pattern)
            return False

    for name, regex in PII_PATTERNS.items():
        if re.search(regex, action_text):
            logger.error("Blocked PII detection: %s", name)
            return False

    for name, regex in SECRET_PATTERNS.items():
        if re.search(regex, action_text, re.IGNORECASE):
            logger.error("Blocked secret detection: %s", name)
            return False

    return True
