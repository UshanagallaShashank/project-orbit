# utils/resume_parser.py - Auto-summarize uploaded resumes into memory
# ----------------------------------------------------------------------
# Called in a background thread after any PDF/DOCX upload.
#
# Flow:
#   parse_and_store(user_id, raw_text)
#     -> call Gemini to extract structured facts from the raw resume text
#     -> delete any stale [RESUME] memories for this user
#     -> insert fresh facts into the memories table
#
# Why store in memories (not documents)?
#   fetch_user_context() already pulls memories and injects them into
#   every agent prompt. By storing the resume summary there, the job
#   agent, orchestrator, and mentor all automatically know the user's
#   profile without reading the raw document each time.
#
# Memory format:
#   Each fact is prefixed with [RESUME] so it can be identified and
#   replaced cleanly when the user uploads a new resume.

import json
import threading
import logging

from config import supabase, settings
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger(__name__)

# One lock per user - prevents two uploads from writing memories at the same time
_locks: dict[str, threading.Lock] = {}
_locks_mutex = threading.Lock()

MAX_INPUT_CHARS = 12_000  # keep within token budget for the extraction call

EXTRACTION_PROMPT = """You are a resume parser. Read the resume text below and extract key facts.

Return ONLY a valid JSON object with exactly these keys:
{{
  "name": "full name or null",
  "total_experience": "e.g. '3 years' or null",
  "skills": ["skill1", "skill2"],
  "roles": ["role1", "role2"],
  "work_history": ["Company X - Software Engineer (2021-2024)", "Company Y - Intern (2020)"],
  "projects": ["Project Name - short description (tech stack)"],
  "education": ["B.Tech CS - ABC University (2020)"],
  "certifications": ["AWS Certified Developer (2023)"],
  "summary": "2-3 sentence professional summary"
}}

Rules:
- skills: list every technical skill (languages, frameworks, tools, cloud, databases)
- roles: list 3-5 job titles this person is suited for based on their background
- work_history: one string per role, format: "Company - Title (Years)"
- projects: one string per project, format: "Name - description (tech used)". Include personal, academic, and professional projects.
- education: one string per degree, format: "Degree - Institution (Year)"
- certifications: include only if present in resume, otherwise empty list
- summary: write it in third person based on what is in the resume
- Return only the raw JSON. No markdown. No extra text.

RESUME TEXT:
{resume_text}
"""


def _get_lock(user_id: str) -> threading.Lock:
    with _locks_mutex:
        if user_id not in _locks:
            _locks[user_id] = threading.Lock()
        return _locks[user_id]


def _extract_facts(raw_text: str) -> dict | None:
    """Call Gemini to extract structured facts from raw resume text."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        google_api_key=settings.GOOGLE_API_KEY,
    )
    truncated = raw_text[:MAX_INPUT_CHARS]
    prompt = EXTRACTION_PROMPT.format(resume_text=truncated)

    try:
        response = llm.invoke(prompt)
        text = response.content.strip()

        # Strip markdown code fences if the model wraps the JSON
        if text.startswith("```"):
            lines = text.splitlines()
            text = "\n".join(
                line for line in lines
                if not line.startswith("```")
            ).strip()

        return json.loads(text)
    except (json.JSONDecodeError, Exception) as e:
        logger.error("resume_parser: extraction failed: %s", e)
        return None


def _build_memory_rows(user_id: str, facts: dict) -> list[dict]:
    """Convert extracted facts into memory rows for the memories table."""
    rows = []

    def add(text: str):
        rows.append({"user_id": user_id, "content": f"[RESUME] {text}"})

    if facts.get("name"):
        add(f"Name: {facts['name']}")

    if facts.get("summary"):
        add(f"Professional summary: {facts['summary']}")

    if facts.get("total_experience"):
        add(f"Total experience: {facts['total_experience']}")

    if facts.get("skills"):
        skills_str = ", ".join(facts["skills"])
        add(f"Skills: {skills_str}")

    if facts.get("roles"):
        roles_str = ", ".join(facts["roles"])
        add(f"Suited roles: {roles_str}")

    for entry in facts.get("work_history", []):
        add(f"Work history: {entry}")

    for entry in facts.get("projects", []):
        add(f"Project: {entry}")

    for entry in facts.get("education", []):
        add(f"Education: {entry}")

    for entry in facts.get("certifications", []):
        add(f"Certification: {entry}")

    return rows


def _run(user_id: str, raw_text: str):
    lock = _get_lock(user_id)
    if not lock.acquire(blocking=False):
        return  # another upload is already being processed
    try:
        facts = _extract_facts(raw_text)
        if not facts:
            logger.warning("resume_parser: no facts extracted for user %s", user_id)
            return

        # Delete stale [RESUME] memories before inserting fresh ones
        existing = (
            supabase.table("memories")
            .select("id")
            .eq("user_id", user_id)
            .like("content", "[RESUME]%")
            .execute()
        )
        if existing.data:
            stale_ids = [r["id"] for r in existing.data]
            supabase.table("memories").delete().in_("id", stale_ids).execute()

        rows = _build_memory_rows(user_id, facts)
        if rows:
            supabase.table("memories").insert(rows).execute()
            logger.info(
                "resume_parser: stored %d memory facts for user %s",
                len(rows), user_id,
            )

    except Exception as e:
        logger.error("resume_parser: unexpected error for user %s: %s", user_id, e)
    finally:
        lock.release()


def parse_and_store(user_id: str, raw_text: str):
    """
    Kick off resume parsing in a background thread.
    Safe to call from a route handler - never blocks the response.
    """
    threading.Thread(
        target=_run,
        args=(user_id, raw_text),
        daemon=True,
    ).start()
