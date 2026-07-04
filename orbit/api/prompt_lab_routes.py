# Routes for PromptLab: A/B test prompts, EvalAgent judges
from fastapi import APIRouter
from pydantic import BaseModel

from orbit.agents.prompt_lab.prompt_lab import PromptLab

prompt_lab_router = APIRouter()


class PromptLabRequest(BaseModel):
    context: str


@prompt_lab_router.post("/promptlab/ab-test")
def ab_test_prompt(body: PromptLabRequest) -> dict[str, str]:
    return {"results": PromptLab().run(body.context)}
