# Routes for FeatureAgent: propose features, create PR
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.feature_agent.feature_agent import FeatureAgent

feature_router = APIRouter()


class FeatureRequest(BaseModel):
    idea: str


@feature_router.post("/features/propose")
def propose_feature(body: FeatureRequest) -> dict[str, str]:
    return {"proposal": FeatureAgent().run(body.idea)}
