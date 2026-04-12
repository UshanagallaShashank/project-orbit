# routes/auth.py - Login & Register
# ----------------------------------
# ONE job: handle user accounts.
#
# Two routes:
#   POST /api/auth/register  -> creates a new account, returns JWT token
#   POST /api/auth/login     -> checks credentials, returns JWT token
#
# WHY call Supabase directly with httpx (not the SDK)?
#   The Supabase Python SDK had bugs with email confirmation.
#   Raw HTTP calls are simpler and more reliable.
#
# What is a JWT token?
#   A string that proves "I am logged in". Frontend stores it and sends it
#   on every request. Like a wristband at a concert - show it to get in.

from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel, EmailStr
import httpx
from config import settings

router = APIRouter()


class AuthBody(BaseModel):
    email: EmailStr
    password: str


class RefreshBody(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


def _login(email: str, password: str) -> AuthResponse:
    # Private helper - called by both /login and /login/form
    res = httpx.post(
        f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
        json={"email": email, "password": password},
        headers={"apikey": settings.SUPABASE_SERVICE_KEY},
    )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    data = res.json()
    return AuthResponse(
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        user_id=data["user"]["id"],
        email=data["user"]["email"],
    )


@router.post("/register", response_model=AuthResponse)
def register(body: AuthBody):
    res = httpx.post(
        f"{settings.SUPABASE_URL}/auth/v1/signup",
        json={"email": body.email, "password": body.password},
        headers={"apikey": settings.SUPABASE_SERVICE_KEY},
    )
    data = res.json()
    if res.status_code != 200:
        raise HTTPException(status_code=400, detail=data.get("msg", "Registration failed"))
    if not data.get("access_token"):
        raise HTTPException(status_code=400, detail="Disable email confirmation: Supabase -> Auth -> Settings -> Confirm email OFF")
    return AuthResponse(
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        user_id=data["user"]["id"],
        email=data["user"]["email"],
    )


@router.post("/refresh", response_model=AuthResponse)
def refresh(body: RefreshBody):
    res = httpx.post(
        f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token",
        json={"refresh_token": body.refresh_token},
        headers={"apikey": settings.SUPABASE_SERVICE_KEY},
    )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Session expired — please log in again")
    data = res.json()
    return AuthResponse(
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        user_id=data["user"]["id"],
        email=data["user"]["email"],
    )


@router.post("/login", response_model=AuthResponse)
def login(body: AuthBody):
    return _login(body.email, body.password)


# Swagger's Authorize button sends form data (not JSON) - this handles that
@router.post("/login/form", response_model=AuthResponse)
def login_form(username: str = Form(...), password: str = Form(...)):
    return _login(username, password)   # username = email in Swagger's form
