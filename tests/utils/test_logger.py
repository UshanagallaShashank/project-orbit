# Tests that the logger returns named loggers without duplicating handlers
from orbit.utils.logger import get_logger


def test_logger_has_one_handler() -> None:
    logger = get_logger("test_agent")
    logger = get_logger("test_agent")
    assert len(logger.handlers) == 1


def test_logger_is_named_after_agent() -> None:
    assert get_logger("expense_agent").name == "expense_agent"
