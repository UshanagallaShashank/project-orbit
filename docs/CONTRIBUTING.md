# Contributing to Project Orbit

## Setup

1. Install Python 3.12 or newer
2. Create a venv OUTSIDE the repo (`python3 -m venv ~/venvs/orbit-v3`) - the repo lives in iCloud Drive and iCloud corrupts in-project venvs
3. Install deps: `~/venvs/orbit-v3/bin/pip install fastapi uvicorn langgraph langchain supabase python-dotenv httpx pytest`
4. Copy `.env.example` to `.env` and fill in your keys
5. Run `~/venvs/orbit-v3/bin/python -m pytest tests/` to confirm everything passes

## Folder structure

- `orbit/agents/` - one folder per agent, same pattern everywhere
- `orbit/core/` - ModelRouter, LangGraph orchestrator, guardrails
- `orbit/utils/` - logger and DB wrapper, the only places that config lives
- `orbit/types/` - shared types, avoid duplication
- `tests/` - mirrors the orbit/ structure exactly

## How to add a new agent

1. Create `orbit/agents/{name}/` with an `__init__.py` and `{name}_agent.py`
2. The agent file exports one class with a typed `run(request: str) -> str` method
3. Get a logger via `get_logger("{name}")` - never use print
4. Register the agent in `orbit/types/shared.py` (AgentName enum) and wire a node in `orbit/core/langgraph_orchestrator.py`
5. Add a mirrored test file under `tests/agents/{name}/`
6. Open a PR on a `feature/{name}-{description}` branch with test results pasted in

## Rules (non-negotiable)

- Every file starts with exactly one comment line saying what it does
- No emojis or non-ASCII characters in code or comments
- Max 30 lines of logic per file - split if it grows
- Full type hints, `mypy --strict` must pass
- No two files share a name anywhere in the repo
- PR required for every change - no direct pushes to main
