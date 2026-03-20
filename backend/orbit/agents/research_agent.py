"""
ResearchAgent — searches the web and summarizes findings.
Uses ADK's built-in google_search tool.
"""

from google.adk.agents import LlmAgent
from google.adk.tools import google_search

from orbit.config import MODEL

research_agent = LlmAgent(
    name="ResearchAgent",
    model=MODEL,
    description=(
        "Handles all web research, information lookup, and summarization requests. "
        "Use this agent when the user asks to search for, find, look up, or research any topic."
    ),
    instruction="""You are Orbit's Research Agent — a precise, fast web researcher.

Your job:
1. Use the google_search tool to find accurate, up-to-date information.
2. Synthesize search results into a clear, concise answer.
3. Always cite your sources (include URLs when available).
4. If a topic needs multiple searches (e.g. comparing things), run multiple searches.
5. Keep responses focused — no filler, no fluff.

Format your output as:
- A direct answer to the question
- Key supporting points (bullet list if more than 2 points)
- Sources at the bottom

Never fabricate information. If you can't find reliable results, say so clearly.
""",
    tools=[google_search],
    output_key="research_result",
)
