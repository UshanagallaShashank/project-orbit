"""
ADK entry point for the Orbit app.

ADK requires a module named `agent.py` at the package root that exposes `root_agent`.
This is what `adk web orbit`, `adk run orbit`, and `adk api_server` look for.
"""

from orbit.agents.orchestrator import orchestrator

# ADK convention: the root agent must be named `root_agent`
root_agent = orchestrator
