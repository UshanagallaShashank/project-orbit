# Cross-agent shared enums so every agent and the router speak the same names
from enum import StrEnum


class AgentName(StrEnum):
    LEARNING_TRACKER = "learning_tracker"
    EXPENSE = "expense"
    RESUME = "resume"
    MEMORY = "memory"


class ModelRole(StrEnum):
    DEFAULT = "default"
    FALLBACK = "fallback"
    CODING = "coding"
    ESCALATION = "escalation"
