# Runs the real test suite in a subprocess so generated code is actually verified before approval.
# Note: this is process-level isolation, not container isolation - Docker is not available on this
# machine, so it should not be trusted to contain malicious code, only to catch real test failures.
import subprocess
from pathlib import Path

from orbit.utils.logger import get_logger

logger = get_logger("sandbox_agent")

ROOT_DIR = Path(__file__).resolve().parents[3]


class SandboxAgent:
    def run(self, request: str) -> str:
        if "test" in request.lower():
            return self._run_tests()
        return "SandboxAgent: pass a feature branch or 'test' to run the suite"

    def _run_tests(self) -> str:
        result = self.run_pytest()
        status = "PASS" if result["passed"] else "FAIL"
        return f"Test Results: {status}\n{result['output'][-2000:]}"

    def run_pytest(self) -> dict[str, object]:
        logger.info("Running pytest in sandbox")
        proc = subprocess.run(
            ["python", "-m", "pytest", "tests/", "-v"],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
            timeout=120,
        )
        return {
            "passed": proc.returncode == 0,
            "output": proc.stdout + proc.stderr,
            "returncode": proc.returncode,
        }
