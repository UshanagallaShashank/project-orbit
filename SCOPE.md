# Project Orbit — Scope

## Vision

Orbit is a personal AI operating system — a multi-agent backend that acts as a persistent,
intelligent layer over your digital life. It handles research, task management, calendar
scheduling, and long-term memory through a unified conversational API.

---

## Architecture: Multi-Agent Orchestration (Google ADK)

```
User Request
     │
     ▼
┌─────────────────────────────────────────┐
│          Orchestrator (root)            │
│   LlmAgent — routes by intent           │
└──────┬──────┬──────┬──────┬────────────┘
       │      │      │      │
       ▼      ▼      ▼      ▼
  Research  Task  Calendar  Memory
   Agent   Agent   Agent    Agent
       │      │      │      │
       ▼      ▼      ▼      ▼
  Google  JSON DB  GCal   JSON DB
  Search          API
```

### Agents

| Agent | Role | Pattern |
|---|---|---|
| **Orchestrator** | Reads intent, delegates to the right sub-agent | `LlmAgent` with `sub_agents` (dynamic routing) |
| **ResearchAgent** | Web search + summarization | `LlmAgent` + `google_search` built-in tool |
| **TaskAgent** | Create / read / update / delete tasks & notes | `LlmAgent` + custom task tools |
| **CalendarAgent** | Create / query / update Google Calendar events | `LlmAgent` + Google Calendar API tools |
| **MemoryAgent** | Store and retrieve long-term user context | `LlmAgent` + file-based memory tools |

---

## API Surface

All communication is via HTTP REST + Server-Sent Events (SSE) streaming, served by FastAPI
through the ADK `get_fast_api_app` integration.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` | `/list-apps` | List registered agent apps |
| `POST` | `/apps/{app}/users/{uid}/sessions/{sid}` | Create or reset a session |
| `GET` | `/apps/{app}/users/{uid}/sessions/{sid}` | Get session state |
| `POST` | `/run` | Run agent (blocking) |
| `POST` | `/run_sse` | Run agent with SSE streaming |

---

## Data Storage (Phase 1 — local file-based)

| Store | File | Format |
|---|---|---|
| Tasks | `data/tasks.json` | JSON list |
| Memory | `data/memory.json` | JSON key-value |
| Sessions | `data/sessions.db` | SQLite (via ADK) |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ | Gemini model access |
| `GOOGLE_CALENDAR_CREDENTIALS` | Optional | Path to GCal OAuth credentials JSON |
| `GOOGLE_CALENDAR_TOKEN` | Optional | Path to GCal token JSON |
| `MODEL` | Optional | Gemini model ID (default: `gemini-2.0-flash`) |
| `PORT` | Optional | Server port (default: `8080`) |

---

## Phase Roadmap

### Phase 1 — MVP (current)
- [x] Multi-agent orchestration with Google ADK
- [x] Research agent (web search + summarize)
- [x] Task agent (CRUD, JSON storage)
- [x] Calendar agent (Google Calendar API)
- [x] Memory agent (persistent context, JSON storage)
- [x] REST + SSE API via FastAPI

### Phase 2 — Persistence & Auth
- [ ] PostgreSQL for tasks
- [ ] Redis for session cache
- [ ] User authentication (JWT)
- [ ] Multi-user support

### Phase 3 — Intelligence
- [ ] Voice input/output (WebRTC / Whisper)
- [ ] Proactive agent (cron-triggered reminders)
- [ ] Document ingestion (RAG over PDFs, emails)
- [ ] Cross-agent memory sharing

### Phase 4 — Frontend
- [ ] React dashboard (chat + task board + calendar view)
- [ ] Real-time SSE rendering
- [ ] Mobile PWA
