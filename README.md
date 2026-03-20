# Orbit — AI Personal OS

A multi-agent AI backend built with **Google Agent Development Kit (ADK)** and Python.
Orbit acts as a personal AI layer over your digital life — research, tasks, calendar, and memory
through one conversational API.

---

## Tech Stack

- **Runtime**: Python 3.11+
- **AI Framework**: [Google ADK](https://google.github.io/adk-docs/) (`google-adk`)
- **Model**: Gemini 2.0 Flash (via Google AI Studio or Vertex AI)
- **API Server**: FastAPI + Uvicorn (via ADK's `get_fast_api_app`)
- **Streaming**: Server-Sent Events (SSE)
- **Storage**: JSON files (tasks, memory) + SQLite (sessions)

---

## Project Structure

```
project-orbit/
├── main.py                    # FastAPI server entry point
├── requirements.txt
├── .env.example
├── SCOPE.md                   # Architecture & roadmap
└── orbit/
    ├── agent.py               # ADK entry point — exports root_agent
    ├── config.py              # Env vars & constants
    ├── agents/
    │   ├── orchestrator.py    # Root LlmAgent — routes to sub-agents
    │   ├── research_agent.py  # Web search & summarization
    │   ├── task_agent.py      # Task & note CRUD
    │   ├── calendar_agent.py  # Google Calendar integration
    │   └── memory_agent.py    # Long-term user memory
    └── tools/
        ├── task_tools.py      # Task CRUD tool functions
        ├── calendar_tools.py  # Google Calendar API tool functions
        └── memory_tools.py    # Memory store/retrieve tool functions
```

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set GOOGLE_API_KEY at minimum
```

### 3. Run with ADK dev UI (browser chat)

```bash
adk web orbit
```

### 4. Run as REST API server

```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8080
```

---

## API Usage

### Send a message (SSE streaming)

```bash
curl -X POST http://localhost:8080/run_sse \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "orbit",
    "user_id": "user_1",
    "session_id": "session_1",
    "new_message": {
      "role": "user",
      "parts": [{"text": "What tasks do I have today?"}]
    }
  }'
```

### Create a session

```bash
curl -X POST http://localhost:8080/apps/orbit/users/user_1/sessions/session_1
```

### Health check

```bash
curl http://localhost:8080/health
```

---

## Agent Capabilities

| Say... | Agent handles it |
|---|---|
| "Search for the latest news on AI" | ResearchAgent |
| "Add a task: finish the report by Friday" | TaskAgent |
| "Show me my open tasks" | TaskAgent |
| "Schedule a meeting tomorrow at 3pm" | CalendarAgent |
| "What do I have on Thursday?" | CalendarAgent |
| "Remember that I prefer dark mode" | MemoryAgent |
| "What do you know about me?" | MemoryAgent |

---

## Google Calendar Setup (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Google Calendar API**
3. Create OAuth 2.0 credentials → download as `credentials.json`
4. Place `credentials.json` in the project root
5. Set `GOOGLE_CALENDAR_CREDENTIALS=credentials.json` in `.env`
6. On first run the browser will open for OAuth consent — token saved to `token.json`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ | Gemini API key from [Google AI Studio](https://aistudio.google.com) |
| `GOOGLE_CALENDAR_CREDENTIALS` | Optional | Path to GCal OAuth credentials JSON |
| `GOOGLE_CALENDAR_TOKEN` | Optional | Path to GCal token JSON (default: `token.json`) |
| `MODEL` | Optional | Gemini model ID (default: `gemini-2.0-flash`) |
| `PORT` | Optional | Server port (default: `8080`) |
