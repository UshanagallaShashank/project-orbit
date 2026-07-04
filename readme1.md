# Project Orbit v3 — Complete Build Spec

## 1. Overview
A personal multi-agent AI assistant that automates study tracking, expenses, job search, resume updates, and self-proposes its own feature improvements — all inside one self-hosted PWA dashboard, with no external messaging platforms.

---

## 2. Core Stack

| Layer | Tech | Notes |
|---|---|---|
| Orchestration | **LangGraph** | State machine, conditional branching, checkpointing |
| Agent/tool framework | **LangChain** | Tool + memory abstractions |
| Observability | **LangSmith** | Tracing on every agent run |
| Model routing | Custom `ModelRouter` | xAI (Grok) primary, Gemini fallback |
| Backend | **FastAPI** | Python, fits agent code |
| Model config | See Section 2.1 below | Cost-optimized, xAI + Gemini only |
| Database | **Supabase** (Postgres + pgvector) | Managed, already connected |
| Deploy | **Vercel** | Already connected, auto-deploy on merge |
| Frontend | **React PWA** | Installable, works mobile + desktop |

**No Claude/Anthropic API** — excluded per access constraint. EvalAgent judge rotates Grok ↔ Gemini to avoid self-grading bias.

### 2.1 Model Config (cost-optimized, locked)

| Provider | Model | API ID | Price (per 1M tokens) | Role |
|---|---|---|---|---|
| xAI | **Grok 4.1 Fast** | `grok-4-1-fast` | $0.20 in / $0.50 out (cached input as low as $0.05/M) | **Default for almost everything**: TaskAgent, ExpenseAgent, LearningTracker, JobAgent matching, ResumeAgent diffing |
| Gemini | 2.5 Flash-Lite | `gemini-2.5-flash-lite` | $0.10 in / $0.40 out — free-tier eligible | Secondary/fallback, absorbs traffic on Gemini's free tier to save cost |
| xAI | grok-code-fast-1 | `grok-code-fast-1` | $0.20 in / $1.50 out | FeatureAgent's actual code-writing step only |
| Gemini | 2.5 Pro (escalation only) | `gemini-2.5-pro` | $1.25 in / $10.00 out | EvalAgent judging, FeatureAgent's propose step — only where reasoning quality matters more than cost |

```
default_model      = "grok-4-1-fast"
fallback_model     = "gemini-2.5-flash-lite"
coding_model       = "grok-code-fast-1"     # FeatureAgent implement step only
escalation_model   = "gemini-2.5-pro"       # EvalAgent judge, FeatureAgent propose step
```

**Note:** Grok 4.1 Fast is the default per your preference — cheap, fast, 2M context window. Gemini 2.5 Flash-Lite sits as fallback to soak up free-tier traffic and reduce overall spend. EvalAgent still rotates Grok ↔ Gemini for judging (whichever model didn't produce the output being judged), to avoid self-grading bias. xAI's data-sharing program (up to $150/month free API credits) is worth enabling if comfortable, since it could cover most default usage for free. Verify current model IDs/pricing in each console before wiring up billing — both providers ship updates fast.

---

## 3. Agent Roster

### v1 — Ship First (4 agents, ~4 Friday sessions)
| Agent | Job |
|---|---|
| **LearningTracker** | DSA (Striver A2Z) + Core ML + Modern AI + SysDesign progress, daily/weekly digest |
| **ExpenseAgent** | Voice (Deepgram STT + Koala VAD) or manual expense logging, daily/weekly/monthly rollup vs ₹75k budget |
| **ResumeAgent** | Version tracking (Drive), diffs, "tailor for this JD," staleness flags |
| **MemoryAgent** | Redis/Supabase + pgvector — long-term context across all agents |

### v2 — Backlog (add after v1 runs 2-3 weeks)
| Agent | Job |
|---|---|
| **TaskAgent** | Daily scheduler, pulls from Google Calendar, ranks priorities |
| **CommsAgent** | Drafts (never sends) resume/recruiter emails via Gmail |
| **ProjectTracker** | Tracks Lumina/RAGForge/PatchSense/Orbit/etc., flags stale projects, feeds ResumeAgent |
| **LeetCodeAgent** | Pulls solve status (unofficial API), recommends daily 4 problems, spaced repetition, solution review |
| **JobAgent** | Scrapes Greenhouse/Lever (via Chrome MCP), tailors resume, queues for approval — **never auto-submits** |
| **IdeaAgent** | Weekly project ideas tied to your actual open problems |
| **FeatureAgent** | Analyzes repo → proposes feature → branches → implements → pushes PR → **never merges** |
| **CostAgent** | Tracks AI spend (LangSmith + manual token logging for xAI/Gemini), budget alerts, auto model-downgrade |
| **EvalAgent** | LLM-as-judge quality scoring across all agents, rotates Grok/Gemini |
| **LoopAgent** (middleware) | Retry + escalate on failure, capped at 2-3 attempts |
| **GuardrailAgent** (middleware) | Hard-blocks PII leakage, secret exposure, destructive ops — cross-cutting, not bypassable |
| **SandboxAgent** | Tests FeatureAgent's code in isolation (Docker/E2B) before real push — reuses Proofbot's simulate→judge→fix→verify loop |
| **PromptLab** | A/B tests prompt/model variants, EvalAgent picks winner |

---

## 4. MCPs & Integrations

| Source | Type | Used by |
|---|---|---|
| Google Calendar | MCP (connected) | TaskAgent |
| Gmail | MCP (connected) | CommsAgent (draft-only) |
| Google Drive | MCP (connected) | ResumeAgent, ExpenseAgent |
| Supabase | MCP (connected) | MemoryAgent, ExpenseAgent DB |
| Vercel | MCP (connected) | Dashboard deploy |
| Chrome | MCP (connected) | JobAgent (read-only scraping) |
| GitHub | Direct REST API (no MCP) | FeatureAgent (branch/PR) |
| LeetCode | Unofficial GraphQL (no MCP) | LeetCodeAgent — low frequency, read-only |
| PatchSense | Existing tool | Reviews FeatureAgent's PRs |
| Picovoice Koala | Existing (needs procurement) | VAD for voice expense logging |
| Deepgram | Existing | STT for voice expense logging |

**Not used:** Slack, Notion, Telegram, WhatsApp — everything surfaces in-app per your preference.

### 4.1 Infra Cost (locked: free-tier-first)

| Item | Choice | Cost |
|---|---|---|
| Sandbox | **Docker** (not E2B) | Free, self-managed |
| Database | Supabase free tier | Free (500MB, sufficient for this scale) |
| Deploy | Vercel free/hobby tier | Free |
| CI | GitHub Actions free tier | Free (2000 min/month, private repos) |
| LangSmith | Free tier | Free (generous trace limits for personal use) |
| Picovoice Koala | **Deferred** — pending procurement sign-off | Not used in v1; Deepgram-only STT until resolved |
| LLM spend | Grok 4.1 Fast + Gemini 2.5 Flash-Lite | Near-$0 with free tiers/credits (see 2.1) |

**Target: $0 infra cost for v1**, only real spend is LLM token usage beyond free tiers.

---

## 4.2 Eval Storage Schema (Supabase/Postgres, plain tables — not pgvector)

```sql
eval_runs
├── id
├── agent_name        -- which agent's output is being judged
├── run_id            -- FK to LangSmith trace (links full context/cost)
├── input_snapshot    -- what the agent was given
├── output_snapshot   -- what the agent produced
├── judge_model       -- grok or gemini, whichever didn't produce the output
├── score             -- numeric (e.g. 1-10) or pass/fail
├── criteria          -- JSON: what was judged (accuracy, safety, usefulness)
├── reasoning          -- judge's explanation for the score
└── created_at

eval_trends (aggregated view, refreshed nightly)
├── agent_name
├── week_start
├── avg_score
├── score_delta       -- vs previous week, tracks improvement
└── sample_count
```

**Sampling, not full coverage:** don't evaluate every call — sample a fixed % daily (e.g. 20% of JobAgent matches, 100% of FeatureAgent proposals since highest-stakes), log the sampled %.

**Retention:** keep raw `eval_runs` ~90 days for debugging/trend analysis; roll up permanently into `eval_trends` so the long-term improvement story survives without unbounded storage growth.

---

## 5. Safety Rails (non-negotiable)

- FeatureAgent **never merges its own PRs** — human-gated to `develop` only, never `main`
- JobAgent **never auto-submits** applications — queues for one-click approval
- CommsAgent **never auto-sends** emails — drafts only
- No LinkedIn automation anywhere (ToS risk)
- GuardrailAgent blocks destructive ops (deletes, force-push, drop table) regardless of which agent requests it
- SandboxAgent tests code in isolation before any real repo push

---

## 6. UI Stack

```
shadcn/ui (base components) + Aceternity/Magic UI (selective flourishes)
Tailwind CSS + Geist font
Phosphor Icons (multi-weight — duotone for agent status states)
Tremor (analytics cards/charts) + React Flow (live agent orchestration graph)
Magic UI Animated Beam (visualizes data flow between agent nodes)
Sonner (toasts) + TanStack Table (job queue / expense tables) + Vaul (mobile drawers)
Framer Motion (transitions, node pulse animations)
cmdk (command palette)
date-fns (scheduling logic)
React Hook Form + Zod (manual entry forms, if needed)
```

**Real-time updates:** simple polling (3-5 sec interval), no WebSockets for v1 — add later only if lag is actually felt.

### Dashboard tabs
`Today | Progress | Money | Jobs | Resume | Orchestration (live agent graph)`

### Notification/delivery model
- **In-app only** — no Slack/Telegram/external platforms
- **Web Push (Service Worker + Push API)** — triggers on: morning digest ready, job match needs approval, FeatureAgent PR ready for review. Works even with app closed, once PWA is installed and permission granted once.
- **Today tab priority ranking** — TaskAgent ranks what's shown: overdue > time-sensitive (e.g. job posting closing soon) > routine (daily DSA problems) — surfaces the one thing that matters instead of a raw list
- Badge count on app icon for pending items (approvals, reviews)

---

## 6.1 Dev Environment (decide once, apply everywhere)

- **Python version:** pin one (e.g. 3.12) in `pyproject.toml` — avoid version drift across sessions
- **Python dependency manager:** use `uv` or Poetry (pick one, don't mix with plain pip)
- **Node version:** pin via `.nvmrc`
- **Secrets:** `.env` for local secrets (never committed), `.env.example` committed as a template from commit #1
- **GitHub OAuth for your own app:** separate from Claude's MCP connections — your standalone Orbit backend needs its own Google Cloud OAuth client (Console → OAuth consent screen → client ID/secret) to talk to Calendar/Gmail/Drive independently; this is a one-time, somewhat fiddly setup, not automatic reuse of Claude's connections

---

## 7. Build Order

| Phase | Item | Sessions |
|---|---|---|
| 1 | LangGraph skeleton + ModelRouter (xAI/Gemini swap test) | 1 |
| 2 | PWA shell (shadcn + Tailwind + tabs, no real data yet) | 1 |
| 3 | ExpenseAgent (voice + manual) | 1 |
| 4 | LearningTracker (DSA/ML/SysDesign progress) | 1 |
| 5 | ResumeAgent | 1 |
| 6 | MemoryAgent (Supabase + pgvector) | 1-2 |
| **— Ship v1, use for 2-3 weeks —** | | |
| 7 | TaskAgent scheduler + Calendar MCP | 1-2 |
| 8 | React Flow orchestration view + polling wiring | 1 |
| 9 | LeetCodeAgent | 1 |
| 10 | CommsAgent + ProjectTracker | 1-2 |
| 11 | JobAgent (scrape + tailor + approval queue) | 2-3 |
| 12 | FeatureAgent + GitHub API + PatchSense integration | 2-3 |
| 13 | SandboxAgent, GuardrailAgent, LoopAgent | 2 |
| 14 | CostAgent + EvalAgent + PromptLab | 2 |
| 15 | IdeaAgent | 1 |

**Total v1:** ~6-8 sessions. **Full system:** ~20-25 Friday sessions.

---

## 8. Portfolio/Resume Value (why this is worth building)

- "Multi-agent orchestration with LangGraph, provider-agnostic model routing, and independent cost/eval/safety subsystems" — real systems-design answer
- FeatureAgent's scope-gating + human-merge-only design — strong answer to agent autonomy/safety interview questions
- EvalAgent's measured quality trends — rare, most people skip building actual evaluation harnesses
- GuardrailAgent as cross-cutting policy layer — demonstrates security-conscious agent design

---

## 9. Engineering Standards (applies to every feature, every agent)

### Folder structure (strict, no ambiguity)
```
orbit/
├── agents/
│   ├── task_agent/
│   │   ├── scheduler.py
│   │   ├── calendar_sync.py
│   │   └── types.py
│   ├── expense_agent/
│   │   ├── voice_logger.py
│   │   ├── rollup.py
│   │   └── types.py
│   ├── memory_agent/
│   ├── resume_agent/
│   ├── feature_agent/
│   ├── eval_agent/
│   └── ... (one folder per agent, same pattern)
├── core/
│   ├── model_router.py
│   ├── langgraph_orchestrator.py
│   └── guardrails.py
├── utils/
│   ├── db.py             (Supabase client wrapper — only place DB connections live)
│   ├── logger.py         (structured logging — only place logging config lives)
│   ├── formatting.py
│   └── validators.py
├── types/
│   └── shared.py         (cross-agent shared types, avoid duplication)
├── tests/
│   ├── agents/           (mirrors agents/ structure exactly)
│   └── core/
├── frontend/
│   ├── components/
│   ├── pages/
│   └── lib/
└── docs/
    └── CONTRIBUTING.md
```

**Naming rule:** no two files share a name anywhere in the repo, even across folders (e.g. no two `utils.py` — name by what it does: `expense_utils.py`, `resume_utils.py`). Prevents import confusion and unreliable search.

### File size & typing rules
- **Max 30 lines of logic per file** (excluding imports/type defs) — forces single-responsibility files. If a file grows past this, split it.
- **Strict typing everywhere** — Python: full type hints + `mypy --strict` in CI. TypeScript: `strict: true` in `tsconfig.json`, no `any`.
- **One export per file** where practical — one function/class per file, matching filename (e.g. `calendar_sync.py` exports `sync_calendar()`).

### Testing requirement (per feature, mandatory)
- Every new feature/agent function ships with a test file in the mirrored `tests/` path
- Test run + **results attached directly in the PR description** (pass/fail count, coverage %) — not just "tests added," actual output pasted in
- No feature merges without a green test run visible in the PR

### Debugging & observability
- Structured logging only (JSON logs via `utils/logger.py`), tagged with `agent_name`, `run_id` (LangSmith), `timestamp` — no scattered `print()` statements
- Every agent error captured with full context (input, stack trace, run_id) and surfaced in the dashboard's Orchestration tab, not just buried in logs

### Git workflow (strict, per feature)
1. **One branch per feature**: `feature/{agent-name}-{short-description}` (e.g. `feature/expense-agent-voice-logging`)
2. **PR required** — no direct pushes to `develop` or `main`, ever, including for FeatureAgent's own proposals
3. **PR must include:** what changed, why, test results pasted in, screenshots for UI changes
4. **PatchSense review** runs automatically on every PR
5. **Merge only after your explicit approval** — `develop` first, `main` only on stable milestones

### Commit/author identity
- **All commits authored and pushed as you (Shashank)** — git config set to your name/email (`ushanagallashashank@gmail.com` / GitHub `UshanagallaShashank`), never as "Claude," "OpenAI," or any AI identity
- If FeatureAgent generates a commit, it still commits under **your configured git identity** — the AI is a tool you're using, not a co-author of record. Matters for your GitHub contribution graph and anything a recruiter checks.
- No AI-generated commit trailers ("Co-authored-by: Claude" etc.) — commit messages written clean and professional, as if you wrote them

### UI cleanliness principle
- Each tab shows **only what's relevant to that tab** — no cross-dumping (e.g. don't show expense data inside the Progress tab "just in case")
- Empty states matter: clear placeholder if no data yet, never a blank screen
- One primary action per screen — avoid button/option overload

### Open-source readiness (for other developers to pick up)
- `docs/CONTRIBUTING.md` — setup steps, folder structure explanation, how to add a new agent (template + checklist)
- `README.md` — architecture diagram, quickstart, env var list (`.env.example`, never commit real keys)
- Consistent code style enforced via linter (Ruff for Python, ESLint+Prettier for TS) — CI fails on style violations

### Prompt engineering standard (for all agent prompts)
- Clear role + task definition upfront
- Explicit output format (JSON schema where structured output needed)
- Few-shot examples for anything non-trivial
- Explicit constraints stated ("never do X," "always do Y") rather than implied
- Every prompt reviewed against this checklist before going into an agent's code

---

## 10. Open Gaps to Resolve Before Building

1. Confirm LangSmith's cost-tracking support for xAI/Gemini (may need manual token logging as fallback)
2. Get xAI + Gemini API keys/credits confirmed and budgeted
3. Decide GitHub PAT scope for FeatureAgent (repo-specific, not account-wide)
4. Sandbox environment choice: Docker vs E2B for SandboxAgent
5. Procurement sign-off status for Picovoice Koala (per your Lumina notes)