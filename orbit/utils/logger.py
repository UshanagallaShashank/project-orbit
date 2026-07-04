# Colored console logger for the whole project - the only place logging config lives
import logging

LEVEL_COLORS = {
    "DEBUG": "\033[36m",
    "INFO": "\033[32m",
    "WARNING": "\033[33m",
    "ERROR": "\033[31m",
    "CRITICAL": "\033[35m",
}
RESET = "\033[0m"
GRAY = "\033[90m"


class ColorFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        color = LEVEL_COLORS.get(record.levelname, RESET)
        time_part = f"{GRAY}{self.formatTime(record, '%H:%M:%S')}{RESET}"
        level_part = f"{color}{record.levelname:<8}{RESET}"
        name_part = f"{color}{record.name}{RESET}"
        return f"{time_part} {level_part} {name_part} | {record.getMessage()}"


def get_logger(agent_name: str) -> logging.Logger:
    logger = logging.getLogger(agent_name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(ColorFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
