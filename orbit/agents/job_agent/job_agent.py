# Job scraping + approval queue (never auto-submits)
from orbit.utils.logger import get_logger

logger = get_logger("job_agent")

MOCK_JOBS = [
    {"title": "Senior Engineer @ Google", "company": "Google", "url": "greenhouse.io/...", "matched": 0.95},
    {"title": "Staff Engineer @ Meta", "company": "Meta", "url": "greenhouse.io/...", "matched": 0.87},
]


class JobAgent:
    def run(self, request: str) -> str:
        if "search" in request.lower() or "jobs" in request.lower():
            return self._search_jobs()
        if "queue" in request.lower():
            return self._approval_queue()
        return self._search_jobs()

    def _search_jobs(self) -> str:
        logger.info("Searching jobs: found %d", len(MOCK_JOBS))
        jobs_str = "\n".join(f"• {j['title']} @ {j['company']} (Match: {int(j['matched']*100)}%)" for j in MOCK_JOBS)
        return f"Found {len(MOCK_JOBS)} jobs:\n{jobs_str}\n\nReview before applying (never auto-submits)."

    def _approval_queue(self) -> str:
        return f"Job queue: {len(MOCK_JOBS)} pending approval. Review each before submitting."
