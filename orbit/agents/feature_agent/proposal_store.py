# In-memory store for pending code-change proposals awaiting explicit user approval.
# Not persisted to Supabase: proposals are meant to be reviewed and resolved within
# a single backend process lifetime, not queried historically like agent_runs.
import itertools

_next_id = itertools.count(1)
_proposals: dict[int, dict[str, object]] = {}


def create_proposal(task: str, file_path: str, diff: str, test_output: str, tests_passed: bool) -> dict[str, object]:
    proposal_id = next(_next_id)
    proposal = {
        "id": proposal_id,
        "task": task,
        "file_path": file_path,
        "diff": diff,
        "test_output": test_output,
        "tests_passed": tests_passed,
        "status": "pending",
    }
    _proposals[proposal_id] = proposal
    return proposal


def get_proposal(proposal_id: int) -> dict[str, object] | None:
    return _proposals.get(proposal_id)


def list_proposals() -> list[dict[str, object]]:
    return list(_proposals.values())


def resolve_proposal(proposal_id: int, status: str) -> dict[str, object] | None:
    proposal = _proposals.get(proposal_id)
    if proposal is None:
        return None
    proposal["status"] = status
    return proposal
