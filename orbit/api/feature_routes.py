# Routes for FeatureAgent: propose a code change, then explicitly approve or reject it.
# /features/proposals/{id}/apply is the ONLY path that writes to the real working tree -
# proposing and sandbox-testing never touch disk outside the pending proposal store.
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from orbit.agents.feature_agent.feature_agent import FeatureAgent
from orbit.agents.feature_agent.proposal_store import get_proposal, list_proposals, resolve_proposal
from orbit.utils.logger import get_logger

logger = get_logger("feature_routes")
feature_router = APIRouter()

ROOT_DIR = Path(__file__).resolve().parents[2]


class FeatureRequest(BaseModel):
    idea: str


@feature_router.post("/features/propose")
def propose_feature(body: FeatureRequest) -> dict[str, str]:
    return {"proposal": FeatureAgent().run(body.idea)}


@feature_router.get("/features/proposals")
def get_proposals() -> list[dict[str, object]]:
    return list_proposals()


@feature_router.get("/features/proposals/{proposal_id}")
def get_proposal_detail(proposal_id: int) -> dict[str, object]:
    proposal = get_proposal(proposal_id)
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal


@feature_router.post("/features/proposals/{proposal_id}/apply")
def apply_proposal(proposal_id: int) -> dict[str, str]:
    proposal = get_proposal(proposal_id)
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Proposal already {proposal['status']}")

    file_path = str(proposal["file_path"])
    if not file_path or ".." in file_path:
        raise HTTPException(status_code=400, detail="Refusing to write to an invalid or unsafe path")

    target = ROOT_DIR / file_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(str(proposal["diff"]))
    resolve_proposal(proposal_id, "applied")
    logger.info("Applied proposal %s to %s (explicit user approval)", proposal_id, file_path)
    return {"status": "applied", "file_path": file_path}


@feature_router.post("/features/proposals/{proposal_id}/reject")
def reject_proposal(proposal_id: int) -> dict[str, str]:
    proposal = resolve_proposal(proposal_id, "rejected")
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"status": "rejected"}
