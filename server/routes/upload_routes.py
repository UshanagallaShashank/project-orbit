# routes/upload_routes.py - Document upload endpoints
# -----------------------------------------------------
# POST /api/upload  - upload a file (PDF, TXT, DOCX), extract text, store in DB
# GET  /api/upload  - list user's uploaded documents
# DELETE /api/upload/{id} - delete a document
#
# Text extraction:
#   .txt / .md  -> read directly
#   .pdf        -> pypdf (text layer only)
#   .docx       -> python-docx
#
# Stored in the `documents` Supabase table:
#   id, user_id, filename, size_bytes, content (text), preview, created_at

import io
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import supabase, settings

JWT_SECRET = settings.JWT_SECRET

import jwt as pyjwt

router = APIRouter()
security = HTTPBearer()

PREVIEW_CHARS = 300
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


def _get_user_id(creds: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = pyjwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def _extract_text(filename: str, data: bytes) -> str:
    name = filename.lower()

    if name.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(data))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
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

    # Plain text fallback (.txt, .md, .csv, .py, etc.)
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("latin-1")


@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(_get_user_id),
):
    if file.size and file.size > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    content = _extract_text(file.filename or "upload.txt", data)
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
def list_documents(user_id: str = Depends(_get_user_id)):
    res = (
        supabase.table("documents")
        .select("id, filename, size_bytes, preview, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.delete("/{doc_id}")
def delete_document(doc_id: str, user_id: str = Depends(_get_user_id)):
    supabase.table("documents").delete().eq("id", doc_id).eq("user_id", user_id).execute()
    return {"deleted": doc_id}
