"""
Calendar tools — create, list, and update Google Calendar events via the Google Calendar API.
Uses OAuth2 for authentication. On first run, a browser window opens for consent.
"""

import os
from datetime import datetime, timezone
from typing import Optional

from orbit.config import GCAL_CREDENTIALS, GCAL_TOKEN, GCAL_SCOPES


# ── auth helper ───────────────────────────────────────────────────────────────

def _get_calendar_service():
    """Build and return an authenticated Google Calendar service client."""
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    creds = None

    if os.path.exists(GCAL_TOKEN):
        creds = Credentials.from_authorized_user_file(GCAL_TOKEN, GCAL_SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(GCAL_CREDENTIALS):
                raise FileNotFoundError(
                    f"Google Calendar credentials not found at '{GCAL_CREDENTIALS}'. "
                    "Download credentials.json from Google Cloud Console and set "
                    "GOOGLE_CALENDAR_CREDENTIALS in your .env file."
                )
            flow = InstalledAppFlow.from_client_secrets_file(GCAL_CREDENTIALS, GCAL_SCOPES)
            creds = flow.run_local_server(port=0)
        with open(GCAL_TOKEN, "w") as token_file:
            token_file.write(creds.to_json())

    return build("calendar", "v3", credentials=creds)


# ── tools ─────────────────────────────────────────────────────────────────────

def list_calendar_events(
    max_results: int = 10,
    time_min: str = "",
    time_max: str = "",
    calendar_id: str = "primary",
) -> dict:
    """List upcoming Google Calendar events.

    Args:
        max_results: Maximum number of events to return (default 10, max 50).
        time_min: Start of time range in ISO format (e.g. '2025-04-01T00:00:00Z').
                  Defaults to now if not provided.
        time_max: End of time range in ISO format. Optional.
        calendar_id: The calendar to query. Use 'primary' for the main calendar.

    Returns:
        dict: A list of events with id, summary, start, end, and description.
    """
    try:
        service = _get_calendar_service()
        now = datetime.now(timezone.utc).isoformat()
        params = {
            "calendarId": calendar_id,
            "maxResults": min(max_results, 50),
            "singleEvents": True,
            "orderBy": "startTime",
            "timeMin": time_min or now,
        }
        if time_max:
            params["timeMax"] = time_max

        result = service.events().list(**params).execute()
        events = result.get("items", [])

        formatted = [
            {
                "id": e.get("id"),
                "summary": e.get("summary", "(No title)"),
                "start": e.get("start", {}).get("dateTime") or e.get("start", {}).get("date"),
                "end": e.get("end", {}).get("dateTime") or e.get("end", {}).get("date"),
                "description": e.get("description", ""),
                "location": e.get("location", ""),
            }
            for e in events
        ]
        return {"status": "success", "events": formatted, "count": len(formatted)}
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


def create_calendar_event(
    summary: str,
    start_datetime: str,
    end_datetime: str,
    description: str = "",
    location: str = "",
    attendees: str = "",
    calendar_id: str = "primary",
) -> dict:
    """Create a new event on Google Calendar.

    Args:
        summary: The event title.
        start_datetime: Event start in ISO format with timezone (e.g. '2025-04-01T14:00:00+05:30').
        end_datetime: Event end in ISO format with timezone (e.g. '2025-04-01T15:00:00+05:30').
        description: Optional event description or agenda.
        location: Optional location string.
        attendees: Comma-separated list of attendee email addresses. Optional.
        calendar_id: Target calendar. Defaults to 'primary'.

    Returns:
        dict: The created event id, link, and summary, or an error dict.
    """
    try:
        service = _get_calendar_service()
        event_body: dict = {
            "summary": summary,
            "description": description,
            "location": location,
            "start": {"dateTime": start_datetime},
            "end": {"dateTime": end_datetime},
        }
        if attendees:
            event_body["attendees"] = [
                {"email": email.strip()} for email in attendees.split(",") if email.strip()
            ]

        event = service.events().insert(calendarId=calendar_id, body=event_body).execute()
        return {
            "status": "success",
            "event_id": event.get("id"),
            "summary": event.get("summary"),
            "html_link": event.get("htmlLink"),
            "start": event.get("start", {}).get("dateTime"),
            "end": event.get("end", {}).get("dateTime"),
        }
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


def update_calendar_event(
    event_id: str,
    summary: str = "",
    start_datetime: str = "",
    end_datetime: str = "",
    description: str = "",
    location: str = "",
    calendar_id: str = "primary",
) -> dict:
    """Update an existing Google Calendar event. Only provided (non-empty) fields are changed.

    Args:
        event_id: The Google Calendar event id to update.
        summary: New title (leave empty to keep current).
        start_datetime: New start in ISO format (leave empty to keep current).
        end_datetime: New end in ISO format (leave empty to keep current).
        description: New description (leave empty to keep current).
        location: New location (leave empty to keep current).
        calendar_id: Calendar that owns the event. Defaults to 'primary'.

    Returns:
        dict: Updated event details or an error dict.
    """
    try:
        service = _get_calendar_service()
        event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()

        if summary:
            event["summary"] = summary
        if description:
            event["description"] = description
        if location:
            event["location"] = location
        if start_datetime:
            event["start"] = {"dateTime": start_datetime}
        if end_datetime:
            event["end"] = {"dateTime": end_datetime}

        updated = service.events().update(
            calendarId=calendar_id, eventId=event_id, body=event
        ).execute()
        return {
            "status": "success",
            "event_id": updated.get("id"),
            "summary": updated.get("summary"),
            "html_link": updated.get("htmlLink"),
        }
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


def delete_calendar_event(event_id: str, calendar_id: str = "primary") -> dict:
    """Delete a Google Calendar event by its id.

    Args:
        event_id: The event id to delete.
        calendar_id: Calendar that owns the event. Defaults to 'primary'.

    Returns:
        dict: Success confirmation or error dict.
    """
    try:
        service = _get_calendar_service()
        service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        return {"status": "success", "message": f"Event '{event_id}' deleted."}
    except Exception as e:
        return {"status": "error", "error_message": str(e)}
