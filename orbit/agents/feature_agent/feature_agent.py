# Generates a code change for a task, tests it in the sandbox, and retries on failure.
# Never writes to the real working tree itself - only produces a proposal that a human
# must explicitly approve via /features/proposals/{id}/apply before it lands on disk.
from orbit.agents.feature_agent.proposal_store import create_proposal
from orbit.agents.sandbox_agent.sandbox_agent import SandboxAgent
from orbit.core.model_router import ModelRouter
from orbit.types.shared import ModelRole
from orbit.utils.logger import get_logger

logger = get_logger("feature_agent")

MAX_RETRIES = 2

CODE_GEN_PROMPT = """You are a careful senior engineer working on the Project Orbit codebase.
Task: {task}

Respond with ONLY the following two sections, no extra commentary:

FILE: <the relative file path to change>
DIFF:
<the full new file contents, or a unified diff>

{retry_context}
"""


class FeatureAgent:
    def __init__(self) -> None:
        self.router = ModelRouter()
        self.sandbox = SandboxAgent()

    def run(self, request: str) -> str:
        if "propose" not in request.lower() and "idea" not in request.lower() and "implement" not in request.lower():
            return "FeatureAgent: describe a feature/task to propose a code change for"
        return self._propose_and_test(request)

    def _propose_and_test(self, task: str) -> str:
        retry_context = ""
        last_output = ""
        file_path = ""
        diff = ""
        tests_passed = False

        for attempt in range(1, MAX_RETRIES + 2):
            logger.info("FeatureAgent attempt %d for task: %s", attempt, task[:50])
            _, response = self.router.ask(
                ModelRole.CODING, CODE_GEN_PROMPT.format(task=task, retry_context=retry_context)
            )
            file_path, diff = self._parse_response(response)

            test_result = self.sandbox.run_pytest()
            tests_passed = bool(test_result["passed"])
            last_output = str(test_result["output"])

            if tests_passed:
                break
            retry_context = f"Previous attempt's tests failed with:\n{last_output[-1000:]}\nFix the approach and try again."

        proposal = create_proposal(task, file_path, diff, last_output, tests_passed)
        status = "tests passed" if tests_passed else f"tests still failing after {MAX_RETRIES + 1} attempts"
        return (
            f"Proposal #{proposal['id']} created ({status}).\n"
            f"File: {file_path}\n"
            f"Awaiting explicit approval via POST /features/proposals/{proposal['id']}/apply "
            "before anything is written to the real repo."
        )

    def _parse_response(self, response: str) -> tuple[str, str]:
        file_path = ""
        diff_lines: list[str] = []
        in_diff = False
        for line in response.splitlines():
            if line.strip().startswith("FILE:"):
                file_path = line.split("FILE:", 1)[1].strip()
            elif line.strip().startswith("DIFF:"):
                in_diff = True
            elif in_diff:
                diff_lines.append(line)
        return file_path, "\n".join(diff_lines).strip()
