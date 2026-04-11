# routes/chat.py — The Agent Router
# ───────────────────────────────────
# ONE job: receive chat requests and send them to the right agent.
#
# Single URL handles all agents:
#   POST /api/chat/orchestrator  → runs OrchestratorAgent
#   POST /api/chat/task          → runs TaskAgent (not built yet)
#   POST /api/chat/mentor        → runs MentorAgent (not built yet)
#
# WHY one route for all agents?
#   Cleaner. Adding a new agent = one new elif line here + one new file in agents/.
#
# user=Depends(get_current_user) means:
#   Run middleware.py first. If token invalid → stop. If valid → user = { id, email }

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from middleware import get_current_user
from agents import orchestrator_agent as orchestrator

router = APIRouter()


class ChatRequest(BaseModel):
    message: str   # what the user typed


@router.post("/{agent_name}")
async def chat(agent_name: str, body: ChatRequest, user=Depends(get_current_user)):
    if agent_name == "orchestrator":
        return StreamingResponse(
            orchestrator.run_stream(user_id=user["id"], message=body.message),
            media_type="text/plain",
        )

    # Add more agents here as you build them:
    # elif agent_name == "task":
    #     return task.run(user_id=user["id"], message=body.message)

    raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
