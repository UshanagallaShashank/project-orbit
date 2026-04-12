# routes/upload_routes.py - Document upload endpoints
# -----------------------------------------------------
# POST   /api/upload       - upload a file, extract text if possible, store in DB
# GET    /api/upload       - list user's uploaded documents
# DELETE /api/upload/{id}  - delete a document
#
# Supported file types:
#   Text extraction: .pdf (pypdf), .docx (python-docx), .txt/.md/.csv/etc.
#   Metadata only:   .png/.jpg/.jpeg/.webp/.gif (images - stored as reference)
#
# Uses get_current_user from middleware (same as all other routes).

import io
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from config import supabase
from middleware import get_current_user

router = APIRouter()

PREVIEW_CHARS = 300
MAX_BYTES     = 10 * 1024 * 1024  # 10 MB

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def _extract_text(filename: str, data: bytes) -> str:
    name = filename.lower()

    # Images - no text extraction, store a placeholder
    if any(name.endswith(ext) for ext in IMAGE_EXTS):
        return f"[Image file: {filename}]"

    if name.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(data))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            return text or "[PDF with no extractable text]"
        except ImportError:
            raise HTTPException(
                status_code=422,
                detail="PDF support requires pypdf. Run: pip install pypdf",
            )

    if name.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs)
        except ImportError:
            raise HTTPException(
                status_code=422,
                detail="DOCX support requires python-docx. Run: pip install python-docx",
            )

    # Plain text fallback (.txt, .md, .csv, .py, .ts, etc.)
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("latin-1")


@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    user_id = user["id"]

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    content = _extract_text(file.filename or "upload", data)
    preview = content[:PREVIEW_CHARS].replace("\n", " ").strip()

    doc = {
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "filename":   file.filename,
        "size_bytes": len(data),
        "content":    content,
        "preview":    preview,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    supabase.table("documents").insert(doc).execute()

    return {
        "id":         doc["id"],
        "filename":   doc["filename"],
        "size_bytes": doc["size_bytes"],
        "preview":    doc["preview"],
        "created_at": doc["created_at"],
    }


@router.get("")
def list_documents(user=Depends(get_current_user)):
    res = (
        supabase.table("documents")
        .select("id, filename, size_bytes, preview, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.delete("/{doc_id}")
def delete_document(doc_id: str, user=Depends(get_current_user)):
    supabase.table("documents").delete().eq("id", doc_id).eq("user_id", user["id"]).execute()
    return {"deleted": doc_id}
