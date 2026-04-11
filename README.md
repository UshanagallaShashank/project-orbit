# Project Orbit

Personal AI OS — chat with 5 specialized AI agents in a terminal-style UI.

**Stack:** React + Vite · FastAPI · LangChain + Gemini · Supabase

---

## What Is This?

You type a message → the right AI agent replies → it remembers your conversation.
Like WhatsApp but you're chatting with 5 specialized AI bots.

### The 5 Agents (planned)

| Agent | What it does | Status |
|---|---|---|
| OrchestratorAgent | General chat | ✅ Built |
| TaskAgent | Creates and tracks tasks | 🔜 Next |
| TrackerAgent | Logs habits and goals | 🔜 Next |
| MemoryAgent | Saves important facts | 🔜 Next |
| MentorAgent | Career and learning coach | 🔜 Next |

---

## Quickstart

### First time setup (do this once)

```bash
# 1. Create virtual environment OUTSIDE iCloud (important — iCloud corrupts venvs)
mkdir -p ~/venvs
/opt/homebrew/bin/python3.11 -m venv ~/venvs/orbit
source ~/venvs/orbit/bin/activate

# 2. Install packages
cd server
pip install -r requirements.txt

# 3. Create your .env file
cp ../.env.example server/.env
# Open server/.env and fill in your real values
```

### Every day (start the server)

```bash
source ~/venvs/orbit/bin/activate
cd server
make dev          # ← like npm run dev
```

Server runs at → http://localhost:8000
Test your API at → http://localhost:8000/docs

---

## Environment Variables

Copy `.env.example` to `server/.env` and fill in:

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase dashboard → Settings → API → service_role |
| `GOOGLE_API_KEY` | aistudio.google.com → Get API key |
| `JWT_SECRET` | Any random string, 32+ characters |

---

## Available Commands

```bash
make dev        # start the server with hot reload
make install    # install all Python packages
make test       # run unit tests
```

---

## Project Structure

```
orbit/
  server/
    main.py            ← app entry point + CORS
    config.py          ← reads .env, creates Supabase client
    middleware.py      ← checks JWT token on every protected route
    Makefile           ← run commands (make dev, make test)
    routes/
      auth.py          ← POST /api/auth/register, /api/auth/login
      chat.py          ← POST /api/chat/{agent_name}
    agents/
      orchestrator.py  ← LangChain + Gemini, saves history to Supabase
  client/              ← React frontend (not built yet)
  .env.example         ← copy this to server/.env
```

---

## API Endpoints

| Method | Route | What it does | Auth needed |
|---|---|---|---|
| GET | `/health` | Check server is alive | No |
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login, returns token | No |
| POST | `/api/chat/orchestrator` | Chat with Orbit AI | Yes |

---

## How to Test

**Step 1** — Open http://localhost:8000/docs

**Step 2** — Register or login:
```json
POST /api/auth/login
{ "email": "you@example.com", "password": "yourpassword" }
```

**Step 3** — Click **Authorize** (lock icon) → enter your email + password → Authorize

**Step 4** — Chat:
```json
POST /api/chat/orchestrator
{ "message": "hello, what can you do?" }
```

---

## Common Problems

| Problem | Fix |
|---|---|
| `python not found` | Use `python3.11` on Mac |
| `venv broken/corrupted` | venv must be at `~/venvs/orbit`, NOT inside the project (iCloud corrupts it) |
| `server/.env not found` | Run `cp .env.example server/.env` then fill in real values |
| `Invalid API key` | Wrong key in `.env` — use `service_role` key, not `anon` key |
| `Email confirmation required` | Supabase → Auth → Settings → turn off "Confirm email" |
| Gemini model not found | Use `gemini-2.5-flash-lite`, not `gemini-1.5-flash` |
