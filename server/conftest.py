# conftest.py — pytest configuration for the server
# ────────────────────────────────────────────────────
# Adds the server/ directory to sys.path so that imports like
# `from agents.task_agent import run` work inside tests/.
#
# WHY needed?
#   pytest runs from server/. Our code uses bare imports (e.g. `from config import ...`).
#   Without this, Python looks in tests/ for those modules and fails.

import sys
import os

# Add server/ to the import path
sys.path.insert(0, os.path.dirname(__file__))
