# Project Orbit

Personal AI OS — chat with 5 specialized AI agents in a terminal-style UI.

**Stack:** React + Vite · FastAPI · LangChain + Gemini · Supabase

---

## What Is This?

Project Orbit is a personal AI assistant web app. You type a message and it routes your request to the right AI agent — each agent has its own purpose, personality, and memory.

Think of it like WhatsApp, but you're chatting with 5 specialized AI bots.

### The 5 Agents

| Agent | What it does |
|---|---|
| **OrchestratorAgent** | General chat, routes requests to other agents |
| **TaskAgent** | Creates and tracks your tasks |
| **TrackerAgent** | Logs habits, goals, LeetCode count |
| **MemoryAgent** | Saves important facts you tell it |
| **MentorAgent** | Career and learning coach |

---

## How This Project Was Built (The Journey)

This project was built step by step, making decisions deliberately before writing any code.

### Stack Decisions Made

**Why FastAPI over Node/Express?**
Python owns the AI ecosystem. LangChain, structured AI output, and Gemini SDKs are all first-class in Python. FastAPI also auto-generates API docs at `/docs` — no Postman needed.

**Why Supabase over plain Postgres?**
Supabase gives you Auth, a database, and real-time — all free. Writing JWT auth from scratch would take 2 days. Supabase makes it 10 lines. It also includes pgvector for future semantic memory search.

**Why LangChain?**
Without LangChain, you'd manually format prompts, manage conversation history, and parse AI responses. LangChain handles all of that. The killer feature: `.with_structured_output()` — forces Gemini to return a Python object instead of random text.

**Why Gemini only?**
One AI provider keeps it simple. Gemini Flash is fast and cheap for 4 agents. Gemini Pro handles the MentorAgent where reasoning quality matters.

### Build Order (Why This Order Matters)

```
1. Folder structure          ← decide where everything lives before writing code
2. config.py                 ← env vars fail loudly on startup, not silently later
3. models/auth.py            ← define request/response shapes before routes
4. routes/auth.py            ← register + login using Supabase Auth
5. Unit tests for auth       ← prove it works, catch regressions forever
── next: auth middleware → agents → frontend ──
```

### Key GenAI Concepts Used

**Structured Output** — AI returns a Python object, not plain text:
```python
class TaskAgentResponse(BaseModel):
    reply: str
    tasks: list[str] = []

chain = prompt | llm.with_structured_output(TaskAgentResponse)
# response.tasks → save to Supabase. No text parsing, no regex.
```

**Conversation History** — AI has no memory between calls. We send the last N messages every time:
```
Fetch history from Supabase → convert to LangChain format → pass to chain
```

**LLM-as-Judge (Evals)** — You can't assert the exact AI reply. So a second AI call scores the first:
```
Score 1-5: Did the agent correctly extract all tasks? → fail if score < 4
```

---

## Prerequisites

- Python 3.11 (not 3.12+, not 3.14 — packages need 3.11)
- Node.js 18+
- [Supabase](https://supabase.com) account (free)
- [Google AI Studio](https://aistudio.google.com) API key (free)

---

## Setup

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd orbit
```

### 2. Create your env file
```bash
cp .env.example server/.env
# Open server/.env and fill in real values
```

| Key | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase dashboard → Settings → API → service_role key |
| `GOOGLE_API_KEY` | aistudio.google.com → Get API key |
| `JWT_SECRET` | Any random string, 32+ characters |

### 3. Supabase one-time setup
- Dashboard → **Authentication → Settings → disable email confirmation** (for local dev only)

### 4. Start the backend
```bash
cd server

# Create virtual environment with Python 3.11
python3.11 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

Backend → http://localhost:8000  
API docs (interactive, no Postman needed) → http://localhost:8000/docs

### 5. Start the frontend *(not built yet)*
```bash
cd client
npm install
npm run dev
```

Frontend → http://localhost:5173

---

## Testing

### Manual (use this while building)
Open http://localhost:8000/docs → click any route → Try it out → Execute.

### Automated
```bash
cd server
source venv/bin/activate

# Unit tests — fast, no AI calls, no internet needed
pytest tests/unit/ -v

# Eval tests — slow, calls real Gemini, run before PRs only
pytest tests/evals/ -v
```

**Two types of tests and why both matter:**
- **Unit tests** — test your Python code (mock the AI). Fast, free, run always.
- **Evals** — test AI output quality using a judge LLM. Slow, costs tokens, run sparingly.

---

## Project Structure

```
orbit/
  server/
    main.py          ← FastAPI app entry point + CORS
    config.py        ← reads .env, creates Supabase client
    models/
      auth.py        ← request/response shapes (Pydantic)
    routes/
      auth.py        ← POST /register, POST /login
    agents/          ← AI agent logic (LangChain + Gemini) — coming next
    tests/
      unit/          ← fast tests, AI is mocked
      evals/         ← LLM-as-judge quality checks
  client/            ← React frontend (coming later)
  .env.example       ← copy this to server/.env
```

---

## API Endpoints

| Method | Route | What it does | Auth required |
|---|---|---|---|
| GET | `/health` | Check server is alive | No |
| POST | `/api/auth/register` | Create account, returns JWT | No |
| POST | `/api/auth/login` | Login, returns JWT | No |

*More endpoints added as agents are built.*

---

## Common Gotchas

| Problem | Fix |
|---|---|
| `python` not found on Mac | Use `python3.11` |
| Wrong venv active | Check prompt shows `(venv)` not `(.venv)` |
| `.env` not found | Must be at `server/.env`, not project root |
| Email confirmation required | Disable in Supabase → Auth → Settings |
| `pydantic-core` build fails | You're on Python 3.14 — use 3.11 |
