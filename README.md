# Project Orbit

Personal AI OS — 5 specialized AI agents in a terminal-style chat UI.

**Stack:** React + Vite · FastAPI · LangChain + Gemini · Supabase

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Google AI Studio](https://aistudio.google.com) API key (free)

---

## Setup

### 1. Clone & enter the project
```bash
git clone <your-repo-url>
cd orbit
```

### 2. Set up environment variables
```bash
cp .env.example server/.env
# Open server/.env and fill in your keys
```

Keys you need:
| Key | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase dashboard → Settings → API → service_role |
| `GOOGLE_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| `JWT_SECRET` | Any long random string (32+ chars) |

### 3. Supabase setup
- Go to **Authentication → Settings → disable email confirmation** (for local dev)

### 4. Start the backend
```bash
cd server
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at → http://localhost:8000
API docs (no Postman needed) → http://localhost:8000/docs

### 5. Start the frontend _(not built yet)_
```bash
cd client
npm install
npm run dev
```
Frontend runs at → http://localhost:5173

---

## Testing

```bash
cd server

# Unit tests (fast, no AI calls)
pytest tests/unit/ -v

# Eval tests (slow, calls real Gemini — run before PRs)
pytest tests/evals/ -v
```

---

## Project Structure

```
orbit/
  server/          ← FastAPI backend
    config.py      ← env vars + Supabase client
    main.py        ← app entry point
    models/        ← request/response shapes (Pydantic)
    routes/        ← API endpoints
    agents/        ← AI agent logic (LangChain + Gemini)
    tests/
      unit/        ← fast tests, mocked AI
      evals/       ← LLM-as-judge quality tests
  client/          ← React frontend (Vite)
  .env.example     ← copy this to server/.env
```

---

## API Endpoints (so far)

| Method | Route | What it does |
|---|---|---|
| GET | `/health` | Check server is running |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
