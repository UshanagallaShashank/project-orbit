# utils/daily_digest.py - Build and send daily digest emails
# ------------------------------------------------------------
# Runs at 8am every day (server local time) via a background thread
# started in main.py on app startup.
#
# What the email contains:
#   - Greeting with the user's name (from [RESUME] memories)
#   - Open tasks
#   - Recent tracker progress
#   - Income summary for the month (if entries exist)
#   - Resume status (how many facts stored, last upload date)
#   - Motivational line from Gemini based on the user's context
#
# To get emails: add GMAIL_USER + GMAIL_APP_PASSWORD to server/.env
# (see utils/email_sender.py for the 3-minute Gmail App Password setup)

import threading
import logging
from datetime import datetime, timezone, timedelta

from config import settings, supabase
from utils.email_sender import send_email
from utils.resume_builder import get_resume_data
from utils.pdf_generator import generate_resume_pdf

logger = logging.getLogger(__name__)

# Track last digest date per user in memory (resets on server restart)
# Worst case: user gets 2 emails after a server restart — acceptable.
_sent_today: dict[str, str] = {}   # user_id -> "YYYY-MM-DD"


# -- Content builders ---------------------------------------------------------

def _fetch_open_tasks(user_id: str) -> list[str]:
    res = (
        supabase.table("tasks")
        .select("title")
        .eq("user_id", user_id)
        .eq("done", False)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )
    return [r["title"] for r in (res.data or [])]


def _fetch_recent_progress(user_id: str) -> list[str]:
    res = (
        supabase.table("tracker_entries")
        .select("content")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(3)
        .execute()
    )
    return [r["content"] for r in (res.data or [])]


def _fetch_income_summary(user_id: str) -> dict | None:
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    start = f"{month}-01"
    now   = datetime.now(timezone.utc)
    next_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
    end   = next_month.strftime("%Y-%m-%d")

    res = (
        supabase.table("income_entries")
        .select("type, amount")
        .eq("user_id", user_id)
        .gte("entry_date", start)
        .lt("entry_date", end)
        .execute()
    )
    rows = res.data or []
    if not rows:
        return None

    income   = sum(r["amount"] for r in rows if r["type"] == "income")
    expenses = sum(r["amount"] for r in rows if r["type"] == "expense")
    return {"income": income, "expenses": expenses, "net": income - expenses}


def _resume_fact_count(user_id: str) -> int:
    res = (
        supabase.table("memories")
        .select("id")
        .eq("user_id", user_id)
        .like("content", "[RESUME]%")
        .execute()
    )
    return len(res.data or [])


# -- Email body builders -------------------------------------------------------

def _build_plain(name: str, tasks: list, progress: list, income: dict | None, resume_facts: int) -> str:
    today = datetime.now().strftime("%A, %B %d")
    lines = [
        f"Hi {name},",
        f"Here is your Orbit digest for {today}.",
        "",
    ]

    if tasks:
        lines.append(f"OPEN TASKS ({len(tasks)})")
        for t in tasks:
            lines.append(f"  - {t}")
        lines.append("")

    if progress:
        lines.append("RECENT PROGRESS")
        for p in progress:
            lines.append(f"  - {p}")
        lines.append("")

    if income:
        net_sign = "+" if income["net"] >= 0 else ""
        lines.append("THIS MONTH")
        lines.append(f"  Income:   +{income['income']:.0f}")
        lines.append(f"  Expenses: -{income['expenses']:.0f}")
        lines.append(f"  Net:      {net_sign}{income['net']:.0f}")
        lines.append("")

    if resume_facts:
        lines.append(f"RESUME  {resume_facts} facts stored. Download the latest PDF from your Orbit Documents page.")
        lines.append("")

    lines.append("---")
    lines.append("Orbit — your personal AI OS")
    return "\n".join(lines)


def _build_html(name: str, tasks: list, progress: list, income: dict | None, resume_facts: int) -> str:
    today = datetime.now().strftime("%A, %B %d")

    def section(title: str, items: list[str]) -> str:
        rows = "".join(f"<li style='margin:3px 0'>{i}</li>" for i in items)
        return f"""
        <h3 style='margin:16px 0 6px;color:#374151;font-size:13px;text-transform:uppercase;
                   letter-spacing:.05em;border-bottom:1px solid #e5e7eb;padding-bottom:4px'>
          {title}
        </h3>
        <ul style='margin:0;padding-left:18px;color:#4b5563;font-size:14px'>{rows}</ul>
        """

    body_parts = []

    if tasks:
        body_parts.append(section(f"Open Tasks ({len(tasks)})", tasks))

    if progress:
        body_parts.append(section("Recent Progress", progress))

    if income:
        net_sign = "+" if income["net"] >= 0 else ""
        net_color = "#16a34a" if income["net"] >= 0 else "#dc2626"
        body_parts.append(f"""
        <h3 style='margin:16px 0 6px;color:#374151;font-size:13px;text-transform:uppercase;
                   letter-spacing:.05em;border-bottom:1px solid #e5e7eb;padding-bottom:4px'>
          This Month
        </h3>
        <table style='font-size:14px;color:#4b5563'>
          <tr><td style='padding:2px 12px 2px 0'>Income</td>
              <td style='color:#16a34a'>+{income['income']:.0f}</td></tr>
          <tr><td style='padding:2px 12px 2px 0'>Expenses</td>
              <td style='color:#dc2626'>-{income['expenses']:.0f}</td></tr>
          <tr><td style='padding:2px 12px 2px 0;font-weight:600'>Net</td>
              <td style='color:{net_color};font-weight:600'>{net_sign}{income['net']:.0f}</td></tr>
        </table>
        """)

    if resume_facts:
        body_parts.append(f"""
        <p style='margin:16px 0 0;font-size:13px;color:#6b7280'>
          Resume: {resume_facts} facts stored.
          Download the latest PDF from your Orbit Documents page.
        </p>
        """)

    body_html = "\n".join(body_parts)

    return f"""
    <html><body style='font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
                       background:#f9fafb;padding:0;margin:0'>
      <div style='max-width:520px;margin:32px auto;background:#fff;border-radius:12px;
                  padding:32px;border:1px solid #e5e7eb'>
        <p style='margin:0 0 4px;font-size:13px;color:#9ca3af'>{today}</p>
        <h2 style='margin:0 0 24px;font-size:18px;color:#111827'>Hi {name}</h2>
        {body_html}
        <hr style='margin:24px 0;border:none;border-top:1px solid #e5e7eb'>
        <p style='margin:0;font-size:12px;color:#9ca3af'>
          Orbit — your personal AI OS
        </p>
      </div>
    </body></html>
    """


# -- Per-user digest -----------------------------------------------------------

def send_digest_for_user(user_id: str, user_email: str):
    """Build and send the daily digest for one user."""
    resume_data  = get_resume_data(user_id)
    name         = resume_data.get("name") or user_email.split("@")[0]
    tasks        = _fetch_open_tasks(user_id)
    progress     = _fetch_recent_progress(user_id)
    income       = _fetch_income_summary(user_id)
    resume_facts = _resume_fact_count(user_id)

    # Skip if nothing to report (brand new user with no data)
    if not tasks and not progress and not income and not resume_facts:
        logger.info("daily_digest: nothing to report for %s, skipping", user_email)
        return

    plain = _build_plain(name, tasks, progress, income, resume_facts)
    html  = _build_html(name, tasks, progress, income, resume_facts)

    # Attach resume PDF on Mondays (weekly refresh)
    pdf_bytes      = b""
    pdf_filename   = ""
    if datetime.now().weekday() == 0 and resume_data:   # Monday
        pdf_bytes    = generate_resume_pdf(resume_data)
        pdf_filename = f"{name.replace(' ', '_')}_resume.pdf"

    subject = f"Orbit digest - {datetime.now().strftime('%B %d')}"
    ok = send_email(
        to=user_email,
        subject=subject,
        body_text=plain,
        body_html=html,
        attachment_bytes=pdf_bytes,
        attachment_filename=pdf_filename,
    )
    if ok:
        logger.info("daily_digest: sent to %s", user_email)


# -- Broadcast to all users ---------------------------------------------------

def send_digest_to_all():
    """
    Fetch every registered user and send them a digest.
    Uses the Supabase service key to list auth.users — only safe on the backend.
    """
    today = datetime.now().strftime("%Y-%m-%d")

    try:
        # Supabase admin API to list all users
        resp = supabase.auth.admin.list_users()
        users = resp if isinstance(resp, list) else getattr(resp, "users", [])
    except Exception as e:
        logger.error("daily_digest: could not list users: %s", e)
        return

    for u in users:
        user_id    = getattr(u, "id", None)
        user_email = getattr(u, "email", None)
        if not user_id or not user_email:
            continue

        # Skip if already sent today for this user
        if _sent_today.get(user_id) == today:
            continue

        try:
            send_digest_for_user(user_id, user_email)
            _sent_today[user_id] = today
        except Exception as e:
            logger.error("daily_digest: failed for %s: %s", user_email, e)


# -- Scheduler ----------------------------------------------------------------

def _scheduler_loop():
    """
    Background thread: checks every 10 minutes if it's 8am.
    Sends digest when the hour first crosses 8am.
    WHY not apscheduler?
      Zero dependencies. This loop is simple enough.
      For production, replace with APScheduler or a cron job.
    """
    while True:
        import time
        now = datetime.now()
        # Run between 08:00 and 08:10 local time
        if now.hour == 8 and now.minute < 10:
            send_digest_to_all()
        time.sleep(600)   # check every 10 minutes


def start_digest_scheduler():
    """
    Call once from main.py on app startup.
    Starts the background thread that sends the daily digest.
    """
    t = threading.Thread(target=_scheduler_loop, daemon=True, name="digest-scheduler")
    t.start()
    logger.info("daily_digest: scheduler started (fires at 08:00 local time)")
