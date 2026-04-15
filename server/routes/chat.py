# routes/chat.py - Single chat endpoint
# ---------------------------------------
# ONE URL for all messages: POST /api/chat
#
# The orchestrator handles routing internally:
#   "remind me to buy milk" -> task_agent
#   "how do I get promoted?" -> mentor_agent
#   "hey how are you?" -> general chat
#
# The response always includes "agent_used" so the frontend
# knows which agent handled it and what fields to expect:
#   { reply, agent_used: "task", tasks: [...] }
#   { reply, agent_used: "general" }

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from middleware import get_current_user
from agents import orchestrator_agent as orchestrator

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("")
def chat(body: ChatRequest, user=Depends(get_current_user)):
    return orchestrator.run(
        user_id=user["id"],
        message=body.message,
    )
