# utils/resume_builder.py - Parse stored [RESUME] memories into a structured dict
# --------------------------------------------------------------------------------
# resume_parser.py writes facts like:
#   "Name: Shashank"
#   "Skills: Python, FastAPI, React"
#   "Work history: Infosys - Backend Engineer (2021-2024)"
#
# This file reads those rows back out and reconstructs a clean dict
# that pdf_generator.py and daily_digest.py can use.
#
# WHY separate from resume_parser?
#   resume_parser.py WRITES memories (called on upload).
#   resume_builder.py READS memories (called when generating PDF or digest).
#   Separate files, opposite directions. No circular dependency.

from config import supabase

PREFIX = "[RESUME] "


def get_resume_data(user_id: str) -> dict:
    """
    Read all [RESUME] memories for the user and return a structured dict.

    Returns:
    {
        "name":             str,
        "summary":          str,
        "total_experience": str,
        "skills":           list[str],
        "roles":            list[str],
        "work_history":     list[str],
        "projects":         list[str],
        "education":        list[str],
        "certifications":   list[str],
    }

    Returns an empty dict if no resume has been uploaded yet.
    """
    res = (
        supabase.table("memories")
        .select("content")
        .eq("user_id", user_id)
        .like("content", f"{PREFIX}%")
        .execute()
    )
    if not res.data:
        return {}

    data: dict = {
        "name":             "",
        "summary":          "",
        "total_experience": "",
        "skills":           [],
        "roles":            [],
        "work_history":     [],
        "projects":         [],
        "education":        [],
        "certifications":   [],
    }

    for row in res.data:
        # Strip the [RESUME] prefix
        raw = row["content"][len(PREFIX):]

        if raw.startswith("Name: "):
            data["name"] = raw[6:].strip()

        elif raw.startswith("Professional summary: "):
            data["summary"] = raw[22:].strip()

        elif raw.startswith("Total experience: "):
            data["total_experience"] = raw[18:].strip()

        elif raw.startswith("Skills: "):
            data["skills"] = [s.strip() for s in raw[8:].split(",") if s.strip()]

        elif raw.startswith("Suited roles: "):
            data["roles"] = [r.strip() for r in raw[14:].split(",") if r.strip()]

        elif raw.startswith("Work history: "):
            data["work_history"].append(raw[14:].strip())

        elif raw.startswith("Project: "):
            data["projects"].append(raw[9:].strip())

        elif raw.startswith("Education: "):
            data["education"].append(raw[11:].strip())

        elif raw.startswith("Certification: "):
            data["certifications"].append(raw[15:].strip())

    return data


def has_resume(user_id: str) -> bool:
    """Quick check — does this user have any [RESUME] memories stored?"""
    res = (
        supabase.table("memories")
        .select("id")
        .eq("user_id", user_id)
        .like("content", f"{PREFIX}%")
        .limit(1)
        .execute()
    )
    return bool(res.data)
