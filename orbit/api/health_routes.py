# Health check route so the dashboard can verify the backend is alive
from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
