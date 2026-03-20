"""
ResearchAgent — searches the web and summarizes findings.
Uses a custom DuckDuckGo search tool (no API key required) instead of ADK's
built-in google_search, which cannot be mixed with function calling tools.
"""

from google.adk.agents import LlmAgent

from orbit.config import MODEL
from orbit.tools.search_tools import web_search, fetch_page

research_agent = LlmAgent(
    name="ResearchAgent",
    model=MODEL,
    description=(
        "Handles all web research, information lookup, and summarization requests. "
        "Use this agent when the user asks to search for, find, look up, or research any topic."
    ),
    instruction="""You are Orbit's Research Agent — a precise, fast web researcher.

Your job:
1. Use web_search to find accurate, up-to-date information on the topic.
2. If a result looks highly relevant, use fetch_page to get the full content.
3. Synthesize results into a clear, concise answer.
4. Always include source URLs at the bottom.
5. If a topic needs multiple searches (e.g. comparing two things), run them.
6. Keep responses focused — no filler, no fluff.

Format:
- Direct answer first
- Supporting bullet points (if more than 2 points)
- Sources at the bottom as: [Title](url)

Never fabricate information. If search returns nothing useful, say so clearly.
""",
    tools=[web_search, fetch_page],
    output_key="research_result",
)
