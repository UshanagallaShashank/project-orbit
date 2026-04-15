# utils/pdf_generator.py - Generate a clean A4 resume PDF from structured data
# ------------------------------------------------------------------------------
# Takes the dict from resume_builder.get_resume_data() and produces a PDF.
#
# WHY fpdf2?
#   Lightweight, pure Python, no system dependencies (unlike weasyprint which
#   needs Cairo/Pango). fpdf2 gives us direct control over layout and fonts.
#   Install: pip install fpdf2
#
# Layout: clean single-column, ATS-friendly (no tables, no images, no columns)
#   Name (large, centered)
#   Experience + Roles (small, centered, gray)
#   ----------
#   SECTION TITLE
#   body text / bullet points
#   ...

import io
from fpdf import FPDF


# -- Colors -------------------------------------------------------------------
BLACK      = (0,   0,   0)
GRAY       = (100, 100, 100)
DARK_GRAY  = (60,  60,  60)
RULE_COLOR = (180, 180, 180)


class _ResumePDF(FPDF):
    """Custom FPDF subclass with helpers for each resume section."""

    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(left=22, top=20, right=22)
        self.set_auto_page_break(auto=True, margin=18)

    # -- Header helpers -------------------------------------------------------

    def name_block(self, name: str, subtitle: str = ""):
        """Large centered name + optional subtitle line."""
        self.set_font("Helvetica", "B", 20)
        self.set_text_color(*BLACK)
        self.cell(0, 10, name, ln=True, align="C")

        if subtitle:
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*GRAY)
            self.cell(0, 6, subtitle, ln=True, align="C")
            self.set_text_color(*BLACK)

        self.ln(3)

    # -- Section helpers -------------------------------------------------------

    def section_title(self, title: str):
        """Bold section heading with a horizontal rule underneath."""
        self.ln(3)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*DARK_GRAY)
        self.cell(0, 6, title.upper(), ln=True)

        # Horizontal rule
        self.set_draw_color(*RULE_COLOR)
        self.set_line_width(0.3)
        x = self.get_x()
        y = self.get_y()
        self.line(x, y, 188, y)
        self.ln(3)
        self.set_text_color(*BLACK)

    def body_text(self, text: str):
        """Plain paragraph text, wraps automatically."""
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*BLACK)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def bullet(self, text: str):
        """Single bullet point, slightly indented."""
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*BLACK)
        # Save x, indent, write, restore
        self.set_x(self.l_margin + 3)
        self.multi_cell(0, 5, f"-  {text}")

    def skills_line(self, skills: list[str]):
        """All skills on one or two lines, separated by ' | '."""
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*BLACK)
        text = "  |  ".join(skills)
        self.multi_cell(0, 5, text)
        self.ln(1)


# -- Public API ---------------------------------------------------------------

def generate_resume_pdf(data: dict) -> bytes:
    """
    Convert a resume data dict (from resume_builder.get_resume_data())
    into PDF bytes.

    Returns empty bytes if data is empty (no resume uploaded).

    Usage:
        data = resume_builder.get_resume_data(user_id)
        pdf_bytes = generate_resume_pdf(data)
        # send as file response
    """
    if not data:
        return b""

    pdf = _ResumePDF()
    pdf.add_page()

    # -- Name & subtitle --
    name     = data.get("name") or "Resume"
    exp      = data.get("total_experience", "")
    roles    = data.get("roles", [])
    subtitle_parts = []
    if exp:
        subtitle_parts.append(exp)
    if roles:
        subtitle_parts.append(roles[0])   # show top fitted role
    subtitle = "  |  ".join(subtitle_parts)

    pdf.name_block(name, subtitle)

    # -- Summary --
    if data.get("summary"):
        pdf.section_title("Professional Summary")
        pdf.body_text(data["summary"])

    # -- Skills --
    if data.get("skills"):
        pdf.section_title("Skills")
        pdf.skills_line(data["skills"])

    # -- Work Experience --
    if data.get("work_history"):
        pdf.section_title("Work Experience")
        for entry in data["work_history"]:
            pdf.bullet(entry)

    # -- Projects --
    if data.get("projects"):
        pdf.section_title("Projects")
        for entry in data["projects"]:
            pdf.bullet(entry)

    # -- Education --
    if data.get("education"):
        pdf.section_title("Education")
        for entry in data["education"]:
            pdf.bullet(entry)

    # -- Certifications --
    if data.get("certifications"):
        pdf.section_title("Certifications")
        for entry in data["certifications"]:
            pdf.bullet(entry)

    # fpdf2 output() returns a bytearray; cast to bytes for FastAPI Response
    return bytes(pdf.output())
