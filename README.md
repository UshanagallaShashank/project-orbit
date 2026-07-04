# Project Orbit

A personal multi-agent AI assistant that automates study tracking, expenses, job search, and resume updates - all inside one self-hosted PWA dashboard, with no external messaging platforms.

Full build spec lives in [readme1.md](readme1.md). This README covers what is built so far and how to run it.

## Why this exists

Instead of juggling spreadsheets, notes, and job boards, Orbit runs a team of small AI agents that each own one job (track learning, log expenses, watch the resume, remember context) and surface everything in a single dashboard.

## Architecture

```
                        +---------------------+
                        |   React PWA (UI)    |
                        +----------+----------+
                                   |
                                   v
                        +---------------------+
                        |   FastAPI backend   |
                        |     orbit/app.py    |
                        +----------+----------+
                                   |
                                   v
                +------------------+-------------------+
                |     LangGraph orchestrator           |
                |  core/langgraph_orchestrator.py      |
                +--+-----------+-----------+--------+--+
                   |           |           |        |
                   v           v           v        v
             LearningTracker Expense    Resume   Memory
                 Agent        Agent      Agent    Agent
                   |           |           |        |
                   +-----------+-----+-----+--------+
                                     |
                                     v
                          +-------------------+
                          |    ModelRouter    |
                          | Grok <-> Gemini   |
                          +-------------------+
```

## Core stack

| Layer | Tech |
|---|---|
| Orchestration | LangGraph |
| Agent framework | LangChain |
| Observability | LangSmith |
| Model routing | Custom ModelRouter (Grok primary, Gemini fallback) |
| Backend | FastAPI (Python 3.12) |
| Database | Supabase (Postgres + pgvector) |
| Deploy | Vercel |
| Frontend | React PWA |

## Model config (cost-optimized)

| Role | Model | Used for |
|---|---|---|
| default | gemini-2.5-flash-lite | Almost everything (free-tier eligible) |
| fallback | grok-4-1-fast | Backup when Gemini fails (needs xAI credits) |
| coding | grok-code-fast-1 | FeatureAgent code-writing only |
| escalation | gemini-2.5-pro | EvalAgent judging, FeatureAgent proposals |

Note: the spec in readme1.md lists Grok as default - flipped to Gemini until xAI credits are topped up.

## Folder structure

```
orbit/               Python package (backend)
  agents/            One folder per agent
  api/               FastAPI route files
  core/              ModelRouter, orchestrator, guardrails
  utils/             Logger and DB wrapper (only places config lives)
  types/             Cross-agent shared types
tests/               Mirrors the orbit/ structure
frontend/            React PWA (phase 2)
docs/                CONTRIBUTING guide
```

## Quickstart

Important: this project lives in iCloud Drive, and iCloud corrupts virtualenvs stored inside the project. Always create the venv outside the repo.

```bash
# 1. Create a venv OUTSIDE the project and install dependencies
python3 -m venv ~/venvs/orbit-v3
~/venvs/orbit-v3/bin/pip install fastapi uvicorn langgraph langchain supabase python-dotenv httpx pytest

# 2. Set up secrets
cp .env.example .env   # then fill in your real keys

# 3. Run the backend (from the project root)
~/venvs/orbit-v3/bin/uvicorn orbit.app:app --reload

# 4. Run tests
~/venvs/orbit-v3/bin/python -m pytest tests/
```

Once the backend is running, open http://localhost:8000/docs and try `POST /models/test` with a prompt - it calls Gemini first and swaps to Grok automatically if Gemini fails.

To run the dashboard, open a second terminal: `cd frontend && npm install && npm run dev`, then visit http://localhost:5173. See [frontend/README.md](frontend/README.md) for details.

## Environment variables

See [.env.example](.env.example) for the full template. Never commit the real `.env`.

| Variable | Purpose |
|---|---|
| XAI_API_KEY | Grok models (default + coding) |
| GEMINI_API_KEY | Gemini models (fallback + escalation) |
| SUPABASE_URL | Database connection |
| SUPABASE_KEY | Database auth |
| LANGSMITH_API_KEY | Tracing on every agent run |
| DEEPGRAM_API_KEY | Voice expense logging (phase 3) |

## Build order

| Phase | Item | Status |
|---|---|---|
| 1 | LangGraph skeleton + ModelRouter (xAI/Gemini swap test) | Done |
| 2 | PWA shell (React + Tailwind + tabs) | Done |
| 3 | ExpenseAgent (voice + manual) | Stub |
| 4 | LearningTracker | Stub |
| 5 | ResumeAgent | Stub |
| 6 | MemoryAgent (Supabase + pgvector) | Stub |

v2 backlog (TaskAgent, JobAgent, FeatureAgent, EvalAgent, and more) is detailed in [readme1.md](readme1.md).

## Safety rails (non-negotiable)

- FeatureAgent never merges its own PRs - human-gated to develop only
- JobAgent never auto-submits applications - queues for one-click approval
- CommsAgent never auto-sends emails - drafts only
- GuardrailAgent blocks destructive ops regardless of which agent requests them
- No LinkedIn automation anywhere

## Engineering standards

- Max 30 lines of logic per file - single-responsibility files
- Strict typing everywhere (mypy --strict, TS strict mode)
- No two files share a name anywhere in the repo
- Every file starts with one comment line saying what it does
- Structured logging only via `orbit/utils/logger.py` - no scattered prints
- One branch per feature, PR required, tests pasted in the PR description

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup and how to add a new agent.
