# config.py — The Settings File
# ─────────────────────────────
# ONE job: read .env file and create shared clients (Supabase).
# Every other file imports from here. Never read .env anywhere else.
#
# Flow: app starts → Settings reads .env → crashes if key missing → good.
# Better to crash at startup than to fail silently in production.

from pydantic_settings import BaseSettings
from supabase import create_client, Client


class Settings(BaseSettings):
    SUPABASE_URL: str           # required — crashes if missing
    SUPABASE_SERVICE_KEY: str   # required — crashes if missing
    GOOGLE_API_KEY: str         # required — crashes if missing
    JWT_SECRET: str             # required — crashes if missing
    PORT: int = 8000            # optional — defaults to 8000

    class Config:
        env_file = ".env"       # look for values in server/.env


# Created ONCE when app starts. Imported everywhere else.
settings = Settings()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
