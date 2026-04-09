from pydantic import BaseModel, EmailStr


# --- Request shapes (what the frontend sends) ---

class RegisterRequest(BaseModel):
    email: EmailStr       # validates it's a real email format automatically
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123"
            }
        }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123"
            }
        }


# --- Response shapes (what we send back) ---

class AuthResponse(BaseModel):
    access_token: str     # JWT — frontend stores this in localStorage
    token_type: str = "bearer"
    user_id: str
    email: str
