from fastapi import APIRouter, HTTPException
from models.auth import RegisterRequest, LoginRequest, AuthResponse
from config import supabase  # config.py at server root

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    """
    Creates a new user account via Supabase Auth.
    Supabase handles: password hashing, duplicate email check, JWT creation.
    We just call sign_up() and return the token.

    Loophole: Supabase sends a confirmation email by default.
    For development, disable this in Supabase dashboard:
    Authentication → Settings → Disable email confirmations
    """
    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Supabase returns None session if email confirmation is required
    if response.session is None:
        raise HTTPException(
            status_code=400,
            detail="Check your email to confirm your account. Or disable email confirmation in Supabase dashboard for dev."
        )

    return AuthResponse(
        access_token=response.session.access_token,
        user_id=str(response.user.id),
        email=response.user.email,
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    """
    Signs in an existing user via Supabase Auth.
    Returns a JWT (access_token) — frontend stores this and sends it
    in the Authorization header on every subsequent request.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception as e:
        # Don't reveal whether the email exists — always say "invalid credentials"
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        access_token=response.session.access_token,
        user_id=str(response.user.id),
        email=response.user.email,
    )
