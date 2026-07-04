# Route that sends a test prompt through the ModelRouter to verify the Grok-Gemini swap
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole

model_router_api = APIRouter()


class ModelTestRequest(BaseModel):
    prompt: str
    role: ModelRole = ModelRole.DEFAULT


@model_router_api.post("/models/test")
def test_model(body: ModelTestRequest) -> dict[str, str]:
    try:
        model, answer = ModelRouter().ask(body.role, body.prompt)
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Both models failed: {error}") from error
    return {"model": model, "answer": answer}
