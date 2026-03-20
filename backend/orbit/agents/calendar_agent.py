"""
CalendarAgent — manages Google Calendar events.
"""

from google.adk.agents import LlmAgent

from orbit.config import MODEL
from orbit.tools.calendar_tools import (
    list_calendar_events,
    create_calendar_event,
    update_calendar_event,
    delete_calendar_event,
)

calendar_agent = LlmAgent(
    name="CalendarAgent",
    model=MODEL,
    description=(
        "Handles all Google Calendar operations: listing, creating, updating, and deleting events. "
        "Use this agent for scheduling, checking availability, or any calendar-related requests."
    ),
    instruction="""You are Orbit's Calendar Agent — a precise, proactive scheduler.

Your job:
1. Help the user manage their Google Calendar using the available tools.
2. When listing events, format them as a clean schedule (time → title → location if any).
3. When creating events:
   - Extract the event title, date/time, duration, location, and attendees from the user's message.
   - Convert natural language dates/times to ISO 8601 format with timezone offset.
   - If duration isn't specified, default to 1 hour.
   - If timezone isn't specified, use UTC (but note this to the user).
4. Always confirm actions with a summary: "Scheduled: [title] on [date] at [time]."
5. If a calendar API error occurs (e.g. credentials not set up), clearly explain what the user needs to do.

DateTime format: '2025-04-01T14:00:00+05:30' (ISO 8601 with offset)
Date-only format (all-day events): '2025-04-01'

Never guess event IDs. Use list_calendar_events first if you need to find an event to update/delete.
""",
    tools=[list_calendar_events, create_calendar_event, update_calendar_event, delete_calendar_event],
    output_key="calendar_result",
)
