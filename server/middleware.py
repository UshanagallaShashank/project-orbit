# middleware.py — The Security Guard
# ───────────────────────────────────
# ONE job: check if the user is logged in before letting them use any agent.
#
# How it works:
#   1. Frontend sends request with "Authorization: Bearer <token>" in header
#   2. This function reads that token
#   3. Asks Supabase: "is this token real?"
#   4. If yes → passes the user object to the route
#   5. If no  → returns 401 Unauthorized, route never runs
#
# How a route uses it:
#   async def chat(user=Depends(get_current_user)):
#   "Depends" = run get_current_user first, inject the result as `user`

from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
import httpx
from config import settings

# Tells Swagger UI: use this URL to get a token → show Authorize button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login/form")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    res = httpx.get(
        f"{settings.SUPABASE_URL}/auth/v1/user",
        headers={
            "apikey": settings.SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {token}",
        }
    )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return res.json()   # { id, email, ... } — passed into the route as `user`
