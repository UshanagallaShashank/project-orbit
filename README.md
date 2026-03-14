# Orbit — AI Personal OS

> Voice-first AI assistant that knows you, talks to you, acts for you, and remembers everything.

---

## What is Orbit?

Orbit is a personal AI operating system built for developers.

You talk → It listens → It acts → It remembers.

Not a chatbot. A real assistant that plugs into your calendar, GitHub, LeetCode, LinkedIn — and works like a second brain.

---

## Architecture

```
YOU (voice / text)
        ↓
Gemini Live API          ← real-time voice, ~500ms latency
        ↓
Gemini 2.5 Orchestrator  ← routes every request
        ↓
┌──────────┬──────────┬──────────┬──────────┐
TaskAgent  MentorAgent TrackerAgent CommsAgent
(GCP ADK) (Gemini 2.5) (GCP ADK)  (GCP ADK)
   ↓           ↓           ↓           ↓
Calendar   10-part     GitHub      LinkedIn
  MCP      Explain    LeetCode      MCP
            RAG         MCP
             ↓
        Supabase
   ┌──────────────────┐
   │ Postgres (long)  │  ← conversations, evals, token logs, prompts
   │ pgvector (RAG)   │  ← semantic memory search
   │ Storage (audio)  │  ← voice recordings
   └──────────────────┘
```

**Key design decisions:**
| Decision | Reason |
|---|---|
| Gemini Live | Sub-500ms voice. No separate STT/TTS bills |
| Gemini 2.5 | 1M context, best routing reasoning |
| Gemini 2.5 (mentor) | Single API, GCP credits cover it, 1M context handles long explanations |
| Supabase instead of Redis | Free Postgres replaces Redis — zero idle cost |
| Cloud Run instead of VM | Pay per request, scales to zero |

---

## Free Stack — Cost Breakdown

| Service | Free Tier | What it handles |
|---|---|---|
| GCP Cloud Run | 2M req/month | Backend API |
| Gemini Live | GCP credits | Voice layer |
| Gemini 2.5 | GCP credits | Orchestration |
| Supabase | 500MB DB, 1GB Storage | All persistence |
| Firebase Hosting | 10GB, 360MB/day | Frontend dashboard |
| Gemini 2.5 | GCP credits | Mentor + Orchestration |

**Estimated idle cost: $0/month**

---

## Feature Roadmap

| Feature | Status |
|---|---|
| Voice (Gemini Live) | Week 1 |
| Orchestrator (Gemini 2.5) | Week 1 |
| Memory (Supabase Postgres) | Week 1 |
| RAG (pgvector) | Week 2 |
| LeetCode + GitHub MCP | Week 3 |
| Google Calendar MCP | Week 4 |
| Gemini 2.5 Mentor Agent | Week 5 |
| LinkedIn MCP | Week 5 |
| Naukri MCP | Waitlist |
| Evals Dashboard | Week 6 |
| Cloud Run Deploy | Week 7 |
| Screen Awareness | Week 8 |

---

## MCP Servers

```
Orbit Agent
      │
      ├── mcp-google-calendar   → create, read, update events
      ├── mcp-github            → commits, PRs, streak tracking
      ├── mcp-leetcode          → daily stats, problem history
      ├── mcp-linkedin          → job tracking, profile updates
      └── mcp-naukri            → [waitlist] job alerts
```

Each MCP = isolated server. Agent calls it like a function. No API logic inside the brain.

---

## Frontend Dashboard

Built with React + Vite + Tailwind. Hosted on Firebase.

Tracks (all pulled from Supabase):
- Token usage per session (all Gemini)
- API call history with latency
- Voice recordings (playback from Supabase Storage)
- Mentor prompt editor (editable without touching code)
- LeetCode + GitHub streak stats

---

## Project Structure

```
orbit/
├── api/
│   └── main.py                # FastAPI entry point (Cloud Run)
├── agents/
│   ├── orchestrator.py        # Gemini 2.5 — routes all requests
│   ├── task_agent.py          # calendar, scheduling
│   ├── mentor_agent.py        # Gemini 2.5 — teaching layer
│   ├── tracker_agent.py       # LeetCode, GitHub
│   └── comms_agent.py         # LinkedIn
├── voice/
│   └── gemini_live.py         # Gemini Live API handler
├── memory/
│   └── supabase_client.py     # Supabase DB + Storage client
├── rag/
│   ├── embedder.py            # embed conversations → pgvector
│   └── retriever.py           # semantic search
├── mcp_servers/
│   ├── calendar/server.py
│   ├── github/server.py
│   ├── leetcode/server.py
│   ├── linkedin/server.py
│   └── naukri/server.py       # waitlist placeholder
├── evals/
│   └── scorer.py              # response quality scoring
├── frontend/                  # React dashboard (Firebase)
├── .env.example
├── Dockerfile
└── requirements.txt
```

---

## Supabase Setup (One-time)

Create a free project at supabase.com, then run this in the SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  messages JSONB,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT,
  content TEXT,
  embedding vector(768),
  tokens_used INT,
  agent TEXT
);

CREATE TABLE token_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  agent TEXT,
  model TEXT,
  input_tokens INT,
  output_tokens INT,
  latency_ms INT
);

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Then: Supabase → Storage → New bucket → name it `recordings`.

---

## GCP Cloud Run Deploy

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

gcloud run deploy orbit-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=...,GEMINI_API_KEY=...
```

---

## Firebase Frontend Deploy

```bash
npm install -g firebase-tools
firebase login
cd frontend && npm run build
firebase deploy
```

---

## Environment Variables

```env
# GCP / Gemini
GEMINI_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Integrations
GITHUB_TOKEN=
GOOGLE_CALENDAR_CREDS=
LINKEDIN_MCP_TOKEN=
```

---

## Getting Started (Local)

```bash
git clone <your-repo> && cd orbit
pip install -r requirements.txt
cp .env.example .env    # fill in your keys
uvicorn api.main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

---

> *"The best tool is the one you actually use."*
