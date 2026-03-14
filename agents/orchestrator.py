"""
WHAT: Stub orchestrator — keeps the server bootable while agents are being built.
WHY:  api/stream.py imports root_agent at startup. Without this the server crashes.
      Replace this stub with the real orchestrator once all sub-agents are ready.
LIBS: google-adk — Agent is the base class for all ADK agents
"""

import os
from google.adk.agents import Agent

# Minimal agent — just enough to make the WebSocket respond.
# The real orchestrator will route to TaskAgent, MentorAgent, TrackerAgent, CommsAgent.
root_agent = Agent(
    name="orbit_stub",
    model="gemini-2.0-flash-live-001",      # only model that supports Live API (bidiGenerateContent)
    instruction="You are Orbit, a personal AI assistant. Answer helpfully and concisely.",
)
