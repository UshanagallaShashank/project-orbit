# FastAPI entry point that wires all routes into the Orbit backend
from dotenv import load_dotenv
from fastapi import FastAPI

from orbit.api.agent_routes import agent_router
from orbit.api.expense_routes import expense_router
from orbit.api.health_routes import health_router
from orbit.api.model_routes import model_router_api
from orbit.utils.logger import get_logger

load_dotenv()
logger = get_logger("orbit")

app = FastAPI(title="Project Orbit", version="0.1.0")
app.include_router(health_router)
app.include_router(agent_router)
app.include_router(model_router_api)
app.include_router(expense_router)

logger.info("Orbit backend ready")
