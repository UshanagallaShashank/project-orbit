# FastAPI entry point that wires all routes into the Orbit backend
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

from orbit.api.agent_routes import agent_router
from orbit.api.comms_routes import comms_router
from orbit.api.cost_routes import cost_router
from orbit.api.eval_routes import eval_router
from orbit.api.expense_routes import expense_router
from orbit.api.feature_routes import feature_router
from orbit.api.health_routes import health_router
from orbit.api.idea_routes import idea_router
from orbit.api.job_routes import job_router
from orbit.api.learning_routes import learning_router
from orbit.api.leetcode_routes import leetcode_router
from orbit.api.memory_routes import memory_router
from orbit.api.model_routes import model_router_api
from orbit.api.proactive_routes import proactive_router
from orbit.api.project_tracker_routes import project_tracker_router
from orbit.api.prompt_lab_routes import prompt_lab_router
from orbit.api.resume_routes import resume_router
from orbit.api.sandbox_routes import sandbox_router
from orbit.api.task_routes import task_router
from orbit.utils.logger import get_logger

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
logger = get_logger("orbit")

app = FastAPI(title="Project Orbit", version="0.3.0-proactive")
app.include_router(health_router)
app.include_router(agent_router)
app.include_router(model_router_api)
app.include_router(expense_router)
app.include_router(learning_router)
app.include_router(resume_router)
app.include_router(memory_router)
app.include_router(cost_router)
app.include_router(eval_router)
app.include_router(idea_router)
app.include_router(leetcode_router)
app.include_router(project_tracker_router)
app.include_router(task_router)
app.include_router(comms_router)
app.include_router(job_router)
app.include_router(feature_router)
app.include_router(sandbox_router)
app.include_router(prompt_lab_router)
app.include_router(proactive_router)

logger.info("Orbit backend ready")
