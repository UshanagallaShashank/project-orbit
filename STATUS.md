# Project Orbit - Current Status

What actually exists and works right now, verified by running it. No roadmap, no "coming soon" - see [readme1.md](readme1.md) for the full spec and [README.md](README.md) for setup instructions.

## Backend (FastAPI, orbit/)

- **ModelRouter** (`orbit/core/model_router.py`) - calls Gemini 2.5 Flash-Lite by default, automatically swaps to Grok 4.1 Fast if the call fails. Verified live with real API keys.
- **LangGraph orchestrator** (`orbit/core/langgraph_orchestrator.py`) - routes a request to one of four agent nodes: learning_tracker, expense, resume, memory.
- **Guardrails** (`orbit/core/guardrails.py`) - blocks requests containing destructive patterns (drop table, force-push, rm -rf) before any agent runs.
- **Colored logger** (`orbit/utils/logger.py`) - every module logs through this, color-coded by level.
- **ExpenseAgent** - full CRUD plus search, verified live against Supabase:
  - `expense_parser.py` - turns free text like "spent 250 on lunch" into structured amount/category/note via the LLM
  - `expense_store.py` - create, list, get, update, delete, and search (by note text, category, date range)
  - `expense_rollup.py` - sums the current month's spending against a 75,000 INR budget
  - Custom categories accepted - any lowercase text, not a fixed list
- **LearningTracker** - full CRUD plus search, verified live: `learning_store.py` tracks topics per track (dsa/core_ml/modern_ai/sysdesign) with a status (not_started/in_progress/done)
- **ResumeAgent** - full CRUD plus search and diff, verified live: `resume_store.py` stores labeled versions, `resume_diff.py` produces a unified line diff between any two versions
- **MemoryAgent** - full CRUD plus search, verified live: `memory_store.py` stores tagged text memories

All four agents' stores were tested with real insert/update/search/delete calls against the live Supabase project in this session, not just faked in unit tests.

## API routes

| Route | Method | Does |
|---|---|---|
| `/health` | GET | Liveness check |
| `/agents/run` | POST | Routes a free-text request through the orchestrator to any of the four agents |
| `/models/test` | POST | Sends a prompt through ModelRouter, returns which model answered |
| `/expenses` | POST, GET | Log an expense, list all expenses |
| `/expenses/{id}` | PUT, DELETE | Edit or remove one expense |
| `/expenses/search` | GET | Filter by note text (`q`), `category`, `start`, `end` |
| `/expenses/summary` | GET | Current month spent/budget/remaining |
| `/learning` | POST, GET | Log a study entry, list all entries |
| `/learning/{id}` | PUT, DELETE | Edit or remove one entry |
| `/learning/search` | GET | Filter by topic text (`q`), `track`, `status` |
| `/resume/versions` | POST, GET | Save a resume version, list all versions |
| `/resume/versions/{id}` | PUT, DELETE | Edit or remove one version |
| `/resume/versions/search` | GET | Filter by label text (`q`) |
| `/resume/versions/diff` | GET | Unified diff between two versions (`old_id`, `new_id`) |
| `/memories` | POST, GET | Save a memory, list all memories |
| `/memories/{id}` | PUT, DELETE | Edit or remove one memory |
| `/memories/search` | GET | Filter by content text (`q`), `tag` |

## Frontend (React PWA, frontend/)

- Six-tab shell: Today, Progress, Money, Jobs, Resume, Orchestration. All tabs stay mounted (hidden, not unmounted) so switching tabs never re-fetches data.
- **Money tab**: month budget bar, category breakdown bars, expense entry form with free-typed categories, search bar (text + category filter), and a list with per-row delete.
- **Progress tab**: log a topic against a track, search/filter by track and status, per-row status dropdown (not started/in progress/done) and delete.
- **Resume tab**: save a new labeled version, search by label, browse versions newest-first with a staleness flag (30+ days old) and delete.
- Today, Jobs, Orchestration show empty-state placeholders only - these need OAuth/scraping/agent-run data that doesn't exist yet.
- BackendStatus pill in the header checks `/health` every 30 seconds.
- All lists load once on mount and refresh only after a mutation (save/edit/delete) or a search - no polling loop on any list.

## Database

Supabase Postgres, project ref `sxvhupuwekhkvzaqxvsx`. One table exists: `expenses` (id, amount, category, note, created_at), with row-level security disabled so the backend's key can write to it. Migration SQL lives in `supabase_migrations/create_expenses_table.sql`.

## UI direction (what to use, what it should look like)

Current state: plain Tailwind, hand-rolled components (buttons, inputs, cards are raw `<div>`/`<input>` with utility classes). No component library installed yet. This section is the target to build toward.

**Libraries to install, one job each:**

| Library | Job |
|---|---|
| shadcn/ui | Base components - buttons, inputs, dialogs, dropdowns, tables. Copied into the repo, not a black-box dependency, so every component stays editable. |
| Tremor | Analytics cards, bar/line/donut charts for Money and Progress tabs |
| React Flow | The live agent graph on the Orchestration tab |
| Magic UI (Animated Beam only) | Visualizes data flowing between agent nodes on Orchestration |
| Phosphor Icons | All icons, duotone weight for agent status states specifically |
| Sonner | Toast notifications (expense saved, agent error, etc.) |
| TanStack Table | Expense list, job queue - sortable/filterable tables once row counts grow |
| Vaul | Bottom-sheet drawers on mobile (edit expense, filters) |
| Framer Motion | Tab transitions, node pulse animations on Orchestration |
| cmdk | Cmd+K command palette for jumping to any tab or action |
| React Hook Form + Zod | Every form gets client-side validation matching the backend's Pydantic rules |
| date-fns | All date formatting and range math (replaces ad hoc `toLocaleDateString` calls) |
| Geist | Font, loaded via `next/font`-style self-hosting or a `<link>` in index.html |

**Visual language (apply everywhere, not just new components):**

- Dark-first: `neutral-950` background, `neutral-100` text, `neutral-800` borders - already the current baseline, keep it
- One accent color only: green-500/600 for primary actions and positive states, red-400 for negative/destructive, yellow-500 for warnings. No other accent colors introduced
- Cards: `rounded-xl border border-neutral-800`, consistent padding (`p-4` or `p-5`), never a raw unbordered block
- Spacing scale: stick to Tailwind's default scale (4, 6, 8...) - no arbitrary pixel values
- Empty states always present, never a blank div - already the pattern in `EmptyState.tsx`, extend it to every new list
- One primary action per screen - a page can have many controls but only one button should look like "the" button (solid green); everything else is outline/ghost
- Motion is subtle and purposeful: tab switches fade, node status pulses on agent activity - never animate for decoration alone

**Migration approach:** introduce shadcn/ui first (it replaces the raw `<button>`/`<input>` elements already in `ExpenseForm.tsx`, `ExpenseList.tsx`, `BudgetSummary.tsx`), then layer Tremor charts into Money and Progress, then React Flow + Magic UI once Orchestration has real agent-run data to visualize. Installing everything before there's real data to feed it produces empty polished shells, not a better product.

## What is NOT built

- No UI for MemoryAgent (backend CRUD+search exists, no dedicated tab - spec doesn't list Memory as a tab, it's cross-cutting)
- No TaskAgent, JobAgent, CommsAgent, FeatureAgent, or any other v2 agent
- No Google/GitHub OAuth wiring - TaskAgent (Calendar), CommsAgent (Gmail), and Drive-synced ResumeAgent all need a Google Cloud OAuth client that only you can provision
- No voice logging (Deepgram/Koala)
- No authentication - this is a single-user app talking to Supabase with a service-role-style key
- No shadcn/ui or other component library yet - see the UI direction section above for the target

## How to run it

Two terminals, from the project root:

```bash
make backend    # FastAPI on :8000
make frontend   # dashboard on :5173
```

See [README.md](README.md) for first-time setup (venv, env vars, database migration).
