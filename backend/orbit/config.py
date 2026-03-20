import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# --- Model ---
MODEL = os.getenv("MODEL", "gemini-2.0-flash")

# --- Google AI ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# --- Google Calendar ---
GCAL_CREDENTIALS = os.getenv("GOOGLE_CALENDAR_CREDENTIALS", "credentials.json")
GCAL_TOKEN = os.getenv("GOOGLE_CALENDAR_TOKEN", "token.json")
GCAL_SCOPES = ["https://www.googleapis.com/auth/calendar"]

# --- Server ---
PORT = int(os.getenv("PORT", "8080"))

# --- App identity (used by ADK Runner) ---
APP_NAME = "orbit"

# --- Local data storage ---
DATA_DIR = Path(__file__).parent.parent.parent / "backend" / "data"
DATA_DIR.mkdir(exist_ok=True)

TASKS_FILE = DATA_DIR / "tasks.json"
MEMORY_FILE = DATA_DIR / "memory.json"
SESSIONS_DB = str(DATA_DIR / "sessions.db")
