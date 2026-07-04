# Calls any configured model through a LangChain-style prompt runtime
import contextvars
import os
from pathlib import Path
from typing import Any, Callable, TypeVar

from dotenv import load_dotenv
from langchain.chat_models import base as chat_base
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence
from langsmith import set_run_metadata, traceable

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")

gemini_key = os.getenv("GEMINI_API_KEY")
if not os.getenv("GOOGLE_API_KEY") and gemini_key:
    os.environ["GOOGLE_API_KEY"] = gemini_key

USD_TO_INR = float(os.getenv("USD_TO_INR_RATE", "83.0"))
LLM_COST_CONTEXT: contextvars.ContextVar[float] = contextvars.ContextVar(
    "orbit_llm_cost", default=0.0
)
LLM_USD_COST_CONTEXT: contextvars.ContextVar[float] = contextvars.ContextVar(
    "orbit_llm_cost_usd", default=0.0
)
LLM_MODEL_CONTEXT: contextvars.ContextVar[list[str]] = contextvars.ContextVar(
    "orbit_llm_models", default=[]
)
LLM_USAGE_CONTEXT: contextvars.ContextVar[dict[str, float | int]] = contextvars.ContextVar(
    "orbit_llm_usage",
    default={
        "input_tokens": 0,
        "output_tokens": 0,
        "total_tokens": 0,
        "input_cost": 0.0,
        "output_cost": 0.0,
        "total_cost": 0.0,
    },
)

MODEL_PRICING: dict[str, dict[str, float]] = {
    "grok-4-1-fast": {
        "prompt_usd_per_1k": 0.0002,
        "completion_usd_per_1k": 0.0005,
    },
    "gemini-2.5-flash-lite": {
        "prompt_usd_per_1k": 0.0001,
        "completion_usd_per_1k": 0.0004,
    },
    "grok-code-fast-1": {
        "prompt_usd_per_1k": 0.0002,
        "completion_usd_per_1k": 0.0015,
    },
    "gemini-2.5-pro": {
        "prompt_usd_per_1k": 0.00125,
        "completion_usd_per_1k": 0.01,
    },
}

MODEL_PROVIDER_OVERRIDE: dict[str, str] = {
    "gemini": "google_genai",
    "grok": "xai",
}


def _get_model_provider(model: str) -> str | None:
    if ":" in model:
        return model.split(":", 1)[0]
    for prefix, provider in MODEL_PROVIDER_OVERRIDE.items():
        if model.startswith(prefix):
            return provider
    return None


class OrbitChatModel(BaseChatModel):
    model_name: str

    @property
    def _llm_type(self) -> str:
        return "orbit-chat"

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: Any | None = None,
        **kwargs: Any,
    ) -> ChatResult:
        prompt_text = "\n".join(self._message_to_text(message) for message in messages)
        content = complete(self.model_name, prompt_text)
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=content))])

    @staticmethod
    def _message_to_text(message: BaseMessage) -> str:
        content = message.content
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, dict) and "text" in item:
                    parts.append(str(item["text"]))
                else:
                    parts.append(str(item))
            return "\n".join(parts)
        return str(content)



def _extract_content_from_chat_result(result: ChatResult) -> str:
    if not result.generations:
        raise ValueError("Chat result contains no generations")
    generation = result.generations[0][0]
    if hasattr(generation, "message") and generation.message is not None:
        return str(generation.message.content)
    return str(generation.text) if hasattr(generation, "text") else ""


F = TypeVar("F", bound=Callable[..., Any])


def _get_model_pricing(model: str) -> dict[str, float]:
    return MODEL_PRICING.get(
        model,
        {
            "prompt_usd_per_1k": 0.0002,
            "completion_usd_per_1k": 0.0005,
        },
    )


def _parse_usage(response: dict[str, Any]) -> tuple[int | None, int | None, int | None]:
    usage = response.get("usage")
    if usage is None:
        if isinstance(response.get("response"), dict):
            usage = response["response"].get("usage")
    if not isinstance(usage, dict):
        return None, None, None

    prompt_tokens = (
        usage.get("prompt_tokens")
        or usage.get("input_tokens")
        or usage.get("promptTokenCount")
        or usage.get("promptTokens")
    )
    completion_tokens = (
        usage.get("completion_tokens")
        or usage.get("output_tokens")
        or usage.get("completion_token_count")
        or usage.get("output_token_count")
        or usage.get("completionTokens")
    )
    total_tokens = (
        usage.get("total_tokens")
        or usage.get("total_token_count")
        or usage.get("totalTokens")
    )
    return prompt_tokens, completion_tokens, total_tokens


def _usd_to_inr(amount: float) -> float:
    return round(amount * USD_TO_INR, 6)


def _compute_cost_usd(model: str, prompt_tokens: int | None, completion_tokens: int | None) -> float:
    if prompt_tokens is None or completion_tokens is None:
        return 0.0
    pricing = _get_model_pricing(model)
    prompt_cost_usd = (prompt_tokens / 1000) * pricing["prompt_usd_per_1k"]
    completion_cost_usd = (completion_tokens / 1000) * pricing["completion_usd_per_1k"]
    return prompt_cost_usd + completion_cost_usd


def _compute_cost_in_inr(model: str, prompt_tokens: int | None, completion_tokens: int | None) -> float:
    return _usd_to_inr(_compute_cost_usd(model, prompt_tokens, completion_tokens))


def _add_llm_cost(cost_in_inr: float) -> None:
    current = LLM_COST_CONTEXT.get()
    LLM_COST_CONTEXT.set(current + cost_in_inr)


def _add_llm_cost_usd(cost_usd: float) -> None:
    current = LLM_USD_COST_CONTEXT.get()
    LLM_USD_COST_CONTEXT.set(current + cost_usd)


def _add_llm_usage(
    input_tokens: int,
    output_tokens: int,
    total_tokens: int,
    input_cost: float,
    output_cost: float,
    total_cost: float,
) -> None:
    current = LLM_USAGE_CONTEXT.get().copy()
    current["input_tokens"] += input_tokens
    current["output_tokens"] += output_tokens
    current["total_tokens"] += total_tokens
    current["input_cost"] += input_cost
    current["output_cost"] += output_cost
    current["total_cost"] += total_cost
    LLM_USAGE_CONTEXT.set(current)


def _add_llm_model(model: str) -> None:
    seen = LLM_MODEL_CONTEXT.get()
    if model not in seen:
        LLM_MODEL_CONTEXT.set(seen + [model])


def clear_llm_cost() -> None:
    LLM_COST_CONTEXT.set(0.0)


def clear_llm_cost_usd() -> None:
    LLM_USD_COST_CONTEXT.set(0.0)


def clear_llm_models() -> None:
    LLM_MODEL_CONTEXT.set([])


def clear_llm_usage() -> None:
    LLM_USAGE_CONTEXT.set(
        {
            "input_tokens": 0,
            "output_tokens": 0,
            "total_tokens": 0,
            "input_cost": 0.0,
            "output_cost": 0.0,
            "total_cost": 0.0,
        }
    )


def get_llm_cost() -> float:
    return LLM_COST_CONTEXT.get()


def get_llm_cost_usd() -> float:
    return LLM_USD_COST_CONTEXT.get()


def get_llm_models() -> list[str]:
    return LLM_MODEL_CONTEXT.get()


def get_llm_usage() -> dict[str, float | int]:
    return LLM_USAGE_CONTEXT.get()


def trace_orbit(func: F) -> F:
    tracing_enabled = os.getenv("LANGSMITH_TRACING", "").lower() in {"1", "true", "yes", "on"}
    api_key = os.getenv("LANGSMITH_API_KEY")
    if tracing_enabled or api_key:
        os.environ.setdefault("LANGSMITH_PROJECT", "v-orbit")
        os.environ.setdefault("LANGSMITH_TRACING_V2", "true")
        return traceable(func, project_name="v-orbit", metadata={"service": "orbit-backend"})  # type: ignore[return-value]
    return func


@trace_orbit
def complete(model: str, prompt: str) -> str:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not os.getenv("GOOGLE_API_KEY") and gemini_key:
        os.environ["GOOGLE_API_KEY"] = gemini_key
    model_provider = _get_model_provider(model)
    chat_model = chat_base.init_chat_model(model, model_provider=model_provider)
    result = chat_model.generate([[HumanMessage(content=prompt)]])
    content = _extract_content_from_chat_result(result)
    prompt_tokens, completion_tokens, total_tokens = _parse_usage(result.llm_output or {})
    cost_usd = _compute_cost_usd(model, prompt_tokens, completion_tokens)
    cost_in_inr = _usd_to_inr(cost_usd)
    _add_llm_model(model)
    _add_llm_cost(cost_in_inr)
    _add_llm_cost_usd(cost_usd)
    prompt_cost = 0.0
    output_cost = 0.0
    prompt_cost_inr = 0.0
    output_cost_inr = 0.0
    if prompt_tokens is not None and completion_tokens is not None and total_tokens is not None:
        prompt_cost = (prompt_tokens / 1000) * _get_model_pricing(model)["prompt_usd_per_1k"]
        output_cost = (completion_tokens / 1000) * _get_model_pricing(model)["completion_usd_per_1k"]
        prompt_cost_inr = _usd_to_inr(prompt_cost)
        output_cost_inr = _usd_to_inr(output_cost)
        _add_llm_usage(
            input_tokens=prompt_tokens,
            output_tokens=completion_tokens,
            total_tokens=total_tokens,
            input_cost=prompt_cost_inr,
            output_cost=output_cost_inr,
            total_cost=cost_in_inr,
        )
    set_run_metadata(
        cost=round(cost_in_inr, 12),
        cost_usd=round(cost_usd, 12),
        cost_inr=round(cost_in_inr, 12),
        cost_display=f"{round(cost_in_inr, 12)} INR",
        currency="INR",
        models=[model],
        selected_model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        usage_metadata={
            "input_tokens": prompt_tokens,
            "output_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "input_cost": round(prompt_cost_inr, 12) if prompt_tokens is not None else None,
            "output_cost": round(output_cost_inr, 12) if completion_tokens is not None else None,
            "total_cost": round(cost_in_inr, 12),
            "input_cost_usd": round(prompt_cost, 12) if prompt_tokens is not None else None,
            "output_cost_usd": round(output_cost, 12) if completion_tokens is not None else None,
            "total_cost_usd": round(cost_usd, 12),
        },
    )
    return str(content)


@trace_orbit
def build_prompt_chain(model: str, system_prompt: str = "You are a helpful assistant.") -> RunnableSequence:
    prompt = ChatPromptTemplate.from_messages(
        [("system", system_prompt), ("human", "{text}")]
    )
    chat_model = OrbitChatModel(model_name=model)
    return prompt | chat_model | StrOutputParser()


@trace_orbit
def invoke_prompt(model: str, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
    full_prompt = f"{system_prompt}\n\n{prompt}"
    return complete(model, full_prompt)
