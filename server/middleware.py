from fastapi import Header, HTTPException
from config import settings, supabase


async def get_current_user(authorization: str = Header(...)):
    """
    This is a dependency — FastAPI runs this automatically
    before any route that uses it.

    What it does:
    1. Reads the Authorization header from the request
    2. Extracts the token
    3. Asks Supabase to verify it
    4. Returns the user if valid, rejects if not

    How the frontend sends it:
        Authorization: Bearer eyJhbGc...

    Loophole: if someone sends an expired or fake token,
    Supabase rejects it and we return 401.
    """

    # Header must look like "Bearer <token>"
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = authorization.split(" ")[1]  # grab the token part after "Bearer "

    try:
        # Ask Supabase: is this token real and not expired?
        response = supabase.auth.get_user(token)
        return response.user  # return the user object to the route
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
