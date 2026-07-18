# Cross-agent shared enums so every agent and the router speak the same names
from enum import StrEnum


class AgentName(StrEnum):
    LEARNING_TRACKER = "learning_tracker"
    EXPENSE = "expense"
    RESUME = "resume"
    MEMORY = "memory"
    COST = "cost"
    EVAL = "eval"
    IDEA = "idea"
    LEETCODE = "leetcode"
    PROJECT_TRACKER = "project_tracker"
    TASK = "task"
    COMMS = "comms"
    QA = "qa"
    JOB = "job"
    MULTI = "multi"
    DELEGATE = "delegate"
    AUTO = "auto"


class ModelRole(StrEnum):
    DEFAULT = "default"
    FALLBACK = "fallback"
    CODING = "coding"
    ESCALATION = "escalation"
