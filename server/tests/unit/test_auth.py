"""
Unit tests for auth routes.

WHY mock Supabase:
  We're testing OUR code (routing, response shape, error handling).
  We're not testing Supabase — that's their job.
  Mocking makes tests fast (no network calls) and reliable (no flaky network).

Run: pytest tests/unit/test_auth.py -v
"""
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys
import os

# Make sure Python can find our modules (routes, models, config)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from main import app

client = TestClient(app)


def make_mock_supabase_response(email: str, user_id: str, token: str):
    """Helper: builds a fake Supabase auth response object."""
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = email

    mock_session = MagicMock()
    mock_session.access_token = token

    mock_response = MagicMock()
    mock_response.user = mock_user
    mock_response.session = mock_session

    return mock_response


# --- Register tests ---

def test_register_success():
    """Happy path: valid email + password returns a token."""
    mock_response = make_mock_supabase_response(
        email="test@example.com",
        user_id="user-123",
        token="fake-jwt-token"
    )

    with patch("routes.auth.supabase") as mock_supabase:
        mock_supabase.auth.sign_up.return_value = mock_response

        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "password123"
        })

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "fake-jwt-token"
    assert data["email"] == "test@example.com"
    assert data["token_type"] == "bearer"


def test_register_invalid_email():
    """Bad email format → 422 (Pydantic catches it before we even call Supabase)."""
    response = client.post("/api/auth/register", json={
        "email": "not-an-email",
        "password": "password123"
    })
    assert response.status_code == 422   # Pydantic validation error


def test_register_missing_password():
    """Missing field → 422."""
    response = client.post("/api/auth/register", json={
        "email": "test@example.com"
        # password missing
    })
    assert response.status_code == 422


# --- Login tests ---

def test_login_success():
    """Happy path: correct credentials returns a token."""
    mock_response = make_mock_supabase_response(
        email="test@example.com",
        user_id="user-123",
        token="fake-jwt-token"
    )

    with patch("routes.auth.supabase") as mock_supabase:
        mock_supabase.auth.sign_in_with_password.return_value = mock_response

        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })

    assert response.status_code == 200
    assert response.json()["access_token"] == "fake-jwt-token"


def test_login_wrong_password():
    """Wrong password → Supabase raises exception → we return 401."""
    with patch("routes.auth.supabase") as mock_supabase:
        mock_supabase.auth.sign_in_with_password.side_effect = Exception("Invalid credentials")

        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"
