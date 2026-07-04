# Routes for ProactiveAgent: autonomously monitor, predict, act
import asyncio
from typing import AsyncGenerator

from fastapi import APIRouter, WebSocket
from pydantic import BaseModel

from orbit.agents.proactive_agent.proactive_agent import ProactiveAgent
from orbit.agents.proactive_agent.proactive_scheduler import ProactiveScheduler

proactive_router = APIRouter()

# Global singleton agent and scheduler (persists across requests)
_agent_instance: ProactiveAgent | None = None
_scheduler_instance: ProactiveScheduler | None = None


def get_agent() -> ProactiveAgent:
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = ProactiveAgent()
    return _agent_instance


def get_scheduler() -> ProactiveScheduler:
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = ProactiveScheduler(interval_minutes=30)
    return _scheduler_instance


class ProactiveRequest(BaseModel):
    action: str = "scan"


@proactive_router.get("/proactive/scan")
def manual_scan() -> dict[str, str]:
    agent = get_agent()
    return {"insights": agent.run("scan")}


@proactive_router.get("/proactive/actions")
def get_suggested_actions() -> dict[str, str]:
    agent = get_agent()
    return {"actions": agent.run("actions")}


@proactive_router.get("/proactive/report")
def get_report() -> dict[str, str]:
    agent = get_agent()
    return {"report": agent.run("report")}


@proactive_router.get("/proactive/status")
def scheduler_status() -> dict:
    scheduler = get_scheduler()
    return {"scheduler": scheduler.status()}


@proactive_router.post("/proactive/start")
async def start_scheduler() -> dict[str, str]:
    scheduler = get_scheduler()
    if not scheduler.is_running:
        asyncio.create_task(scheduler.start())
        return {"status": "Proactive scheduler started"}
    return {"status": "Scheduler already running"}


@proactive_router.post("/proactive/stop")
async def stop_scheduler() -> dict[str, str]:
    scheduler = get_scheduler()
    if scheduler.is_running:
        await scheduler.stop()
        return {"status": "Proactive scheduler stopped"}
    return {"status": "Scheduler not running"}


@proactive_router.websocket("/ws/proactive")
async def websocket_proactive(websocket: WebSocket) -> None:
    await websocket.accept()
    scheduler = get_scheduler()

    async def callback(data: dict) -> None:
        await websocket.send_json({
            "type": "proactive_update",
            "insights": data["insights"],
            "actions": data["actions"]
        })

    scheduler.register_callback(callback)

    try:
        while True:
            await asyncio.sleep(1)
    except Exception as e:
        await websocket.close()
