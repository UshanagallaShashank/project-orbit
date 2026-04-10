"""
Unit tests for auth middleware.

Run: pytest tests/unit/test_middleware.py -v
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from middleware import get_current_user
from fastapi import Depends


# Build a tiny test app with one protected route
app = FastAPI()

@app.get("/protected")
async def protected_route(user=Depends(get_current_user)):
    return {"user_id": str(user.id)}

client = TestClient(app)


def test_valid_token_passes():
    """Valid token → middleware lets the request through."""
    mock_user = MagicMock()
    mock_user.id = "user-123"

    mock_response = MagicMock()
    mock_response.user = mock_user

    with patch("middleware.supabase") as mock_supabase:
        mock_supabase.auth.get_user.return_value = mock_response

        response = client.get("/protected", headers={
            "Authorization": "Bearer valid-token"
        })

    assert response.status_code == 200
    assert response.json()["user_id"] == "user-123"


def test_missing_token_rejected():
    """No Authorization header → 422 (FastAPI rejects before middleware runs)."""
    response = client.get("/protected")
    assert response.status_code == 422


def test_wrong_format_rejected():
    """Token without 'Bearer ' prefix → 401."""
    response = client.get("/protected", headers={
        "Authorization": "justthetoken"
    })
    assert response.status_code == 401


def test_invalid_token_rejected():
    """Fake/expired token → Supabase throws → 401."""
    with patch("middleware.supabase") as mock_supabase:
        mock_supabase.auth.get_user.side_effect = Exception("Token expired")

        response = client.get("/protected", headers={
            "Authorization": "Bearer fake-token"
        })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"
