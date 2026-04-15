# utils/email_sender.py - Send email via Resend
# -----------------------------------------------
# Uses the Resend API — no password needed, just an API key.
# Free tier: 3000 emails/month, 100/day.
#
# WHY Resend over Gmail SMTP?
#   Gmail SMTP requires your password (or an App Password tied to your account).
#   Resend uses an API key that can be revoked any time without touching
#   your Gmail account. It is scoped to email sending only.
#
# Setup (already done — you have the key):
#   Add to server/.env:
#     RESEND_API_KEY=re_xxxxxxxxxxxx
#
# Install:
#   pip install resend
#
# Sender address:
#   Resend free tier sends from "onboarding@resend.dev" by default.
#   This works fine for personal use. To use your own domain later,
#   verify it at resend.com/domains (takes 5 minutes).

import base64
import logging

from config import settings

logger = logging.getLogger(__name__)


def send_email(
    to: str,
    subject: str,
    body_text: str,
    body_html: str = "",
    attachment_bytes: bytes = b"",
    attachment_filename: str = "",
) -> bool:
    """
    Send an email via Resend.

    Args:
        to:                  recipient email address
        subject:             email subject line
        body_text:           plain-text body (always included)
        body_html:           optional HTML version (looks nicer in email clients)
        attachment_bytes:    optional file bytes (e.g. resume PDF)
        attachment_filename: filename shown in the email attachment

    Returns True if sent, False if not configured or failed.
    """
    if not settings.RESEND_API_KEY:
        logger.warning("email_sender: RESEND_API_KEY not set in .env — skipping")
        return False

    try:
        import resend
    except ImportError:
        logger.error("email_sender: resend package not installed. Run: pip install resend")
        return False

    resend.api_key = settings.RESEND_API_KEY

    params: dict = {
        "from":    "Orbit <onboarding@resend.dev>",
        "to":      [to],
        "subject": subject,
        "text":    body_text,
    }

    if body_html:
        params["html"] = body_html

    # Attach file if provided (Resend expects base64-encoded content)
    if attachment_bytes and attachment_filename:
        params["attachments"] = [
            {
                "filename": attachment_filename,
                "content":  base64.b64encode(attachment_bytes).decode("utf-8"),
            }
        ]

    try:
        resend.Emails.send(params)
        logger.info("email_sender: sent '%s' to %s", subject, to)
        return True
    except Exception as e:
        logger.error("email_sender: failed — %s", e)
        return False
