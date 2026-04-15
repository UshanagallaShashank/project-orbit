# routes/resume_routes.py - Resume PDF download and preview endpoints
# -------------------------------------------------------------------
# GET /api/resume/pdf      -> download the user's resume as a PDF file
# GET /api/resume/data     -> return the structured resume data as JSON
# POST /api/resume/digest  -> manually trigger a digest email (for testing)
#
# The PDF is generated fresh on every request from the [RESUME] memories.
# No PDF is stored — it is always rebuilt from the latest facts.
# This means: upload a new resume -> parse_and_store runs -> memories update
# -> next PDF download reflects the new resume automatically.

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from middleware import get_current_user
from utils.resume_builder import get_resume_data
from utils.pdf_generator import generate_resume_pdf

router = APIRouter()


@router.get("/pdf")
def download_resume_pdf(user=Depends(get_current_user)):
    """
    Generate the user's resume as a PDF and return it as a file download.
    The browser will prompt "Save As" or open the PDF inline.
    """
    data = get_resume_data(user["id"])

    if not data:
        raise HTTPException(
            status_code=404,
            detail="No resume found. Upload your resume on the Documents page first.",
        )

    try:
        pdf_bytes = generate_resume_pdf(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    name     = (data.get("name") or "resume").replace(" ", "_")
    filename = f"{name}_resume.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.get("/data")
def get_resume_json(user=Depends(get_current_user)):
    """
    Return the structured resume data as JSON.
    Useful for the frontend to show a preview of what's stored.
    """
    data = get_resume_data(user["id"])
    if not data:
        return {"found": False}
    return {"found": True, **data}


@router.post("/digest")
def send_test_digest(user=Depends(get_current_user)):
    """
    Manually trigger a digest email for the current user.
    Use this to test that email delivery is working.
    """
    from utils.daily_digest import send_digest_for_user
    user_email = user.get("email", "")
    if not user_email:
        raise HTTPException(status_code=400, detail="No email address on your account.")

    send_digest_for_user(user["id"], user_email)
    return {"sent": True, "to": user_email}
