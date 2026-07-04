# Supabase client wrapper - the only place database connections live
import os

from supabase import Client, create_client


def get_db() -> Client:
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
