# Drives the running frontend with Playwright and clicks through each tab's golden path
from playwright.sync_api import sync_playwright

from orbit.core.agent_run_store import log_tool_call
from orbit.utils.logger import get_logger

logger = get_logger("qa_agent")

FRONTEND_URL = "http://localhost:5173"
TAB_LABELS = ["Agent Room", "Today", "Progress", "Money", "Jobs", "Resume", "Orchestration"]


class QAAgent:
    def run(self, request: str, run_id: int | None = None) -> str:
        logger.info("Running QA pass: %s", request[:50])
        results: list[str] = []
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch()
                page = browser.new_page()
                self._log(run_id, "playwright:goto", FRONTEND_URL)
                page.goto(FRONTEND_URL, timeout=10000)

                for label in TAB_LABELS:
                    outcome = self._click_tab(page, label, run_id)
                    results.append(outcome)

                browser.close()
        except Exception as exc:
            self._log(run_id, "playwright:error", str(exc), status="error")
            return f"QA run failed: {exc}"

        return "\n".join(results)

    def _click_tab(self, page: "object", label: str, run_id: int | None) -> str:
        self._log(run_id, f"playwright:click:{label}", label)
        try:
            page.get_by_text(label, exact=True).first.click(timeout=5000)  # type: ignore[attr-defined]
            return f"PASS - {label} tab opened without error"
        except Exception as exc:
            self._log(run_id, f"playwright:click:{label}", label, status="error")
            return f"FAIL - {label} tab: {exc}"

    def _log(self, run_id: int | None, tool_name: str, input_text: str, status: str = "success") -> None:
        if run_id is None:
            return
        try:
            log_tool_call(run_id, tool_name, input_text, "", status=status)
        except Exception:
            logger.warning("Failed to log QA tool call for run %s", run_id)
