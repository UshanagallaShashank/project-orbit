# Tests that ModelRouter picks the right model per role and falls back correctly
from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole


def test_pick_default_model() -> None:
    assert ModelRouter().pick(ModelRole.DEFAULT) == "gemini-2.5-flash-lite"


def test_pick_coding_model() -> None:
    assert ModelRouter().pick(ModelRole.CODING) == "grok-code-fast-1"


def test_fallback_from_gemini_goes_to_grok() -> None:
    assert ModelRouter().fallback_for("gemini-2.5-flash-lite") == "grok-4-1-fast"


def test_fallback_from_grok_goes_back_to_gemini() -> None:
    assert ModelRouter().fallback_for("grok-4-1-fast") == "gemini-2.5-flash-lite"
