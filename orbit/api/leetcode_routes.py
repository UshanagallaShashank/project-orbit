# Routes for LeetCodeAgent: daily problem recommendations, track solves
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.leetcode_agent.leetcode_agent import LeetCodeAgent

leetcode_router = APIRouter()


class LeetCodeRequest(BaseModel):
    action: str = "recommend"


@leetcode_router.get("/leetcode/recommend")
def recommend_daily() -> dict[str, str]:
    return {"recommendations": LeetCodeAgent().run("recommend")}


@leetcode_router.post("/leetcode/track")
def track_solve(body: LeetCodeRequest) -> dict[str, str]:
    return {"result": LeetCodeAgent().run(body.action)}
