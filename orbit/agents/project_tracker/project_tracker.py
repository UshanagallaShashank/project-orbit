# Tracks repos: lists repos, detects stale (>30 days), flags in ResumeAgent
from datetime import datetime, timedelta

from orbit.utils.logger import get_logger

logger = get_logger("project_tracker")

MOCK_PROJECTS = [
    {"name": "project-orbit", "last_commit": datetime.now().isoformat(), "stale": False},
    {"name": "lumina", "last_commit": (datetime.now() - timedelta(days=45)).isoformat(), "stale": True},
    {"name": "rag-forge", "last_commit": (datetime.now() - timedelta(days=20)).isoformat(), "stale": False},
    {"name": "patchsense", "last_commit": (datetime.now() - timedelta(days=60)).isoformat(), "stale": True},
]


class ProjectTracker:
    def run(self, request: str) -> str:
        if "list" in request.lower():
            return self._list_projects()
        if "stale" in request.lower():
            return self._list_stale()
        return self._list_projects()

    def _list_projects(self) -> str:
        logger.info("Listing %d projects", len(MOCK_PROJECTS))
        active = [p for p in MOCK_PROJECTS if not p["stale"]]
        stale = [p for p in MOCK_PROJECTS if p["stale"]]
        return f"Active: {len(active)} | Stale (>30 days): {len(stale)}\nProjects: {', '.join(p['name'] for p in MOCK_PROJECTS)}"

    def _list_stale(self) -> str:
        stale = [p for p in MOCK_PROJECTS if p["stale"]]
        logger.warning("Found %d stale projects", len(stale))
        return f"Stale projects: {', '.join(p['name'] for p in stale)}"
