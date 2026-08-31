"""FastAPI router exposing the MANAK-AI API endpoints."""
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import PlainTextResponse

from app.core import database
from app.schemas import (
    SearchRequest, SearchResponse, CertificationCheckRequest,
    ReviewCreate,
)
from app.services.search_service import (
    run_search, increment_search_count, get_search_count,
)
from app.rules import certification as cert_rules, related as related_rules

router = APIRouter()


def _get_standard_by_number(is_number):
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT is_number, title, category, sub_category, scope,
                          specifications, normative_references, is_qco_mandatory,
                          qco_enforcement_date, version, last_amended,
                          amendment_history, source_excerpt
                   FROM standards WHERE is_number = %s""",
                (is_number,),
            )
            return cur.fetchone()
    finally:
        conn.close()


# ── POST /api/search ──
@router.post("/search", response_model=SearchResponse)
def search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(400, "query is required")
    increment_search_count()
    return run_search(req.query)


# ── POST /api/search/document ──
@router.post("/search/document", response_model=SearchResponse)
async def search_document(document: UploadFile = File(...)):
    filename = document.filename or ""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    content = await document.read()

    if ext == "txt":
        text = content.decode("utf-8", errors="ignore")
    elif ext == "pdf":
        text = _extract_pdf(content)
    elif ext == "docx":
        text = _extract_docx(content)
    else:
        raise HTTPException(400, "Unsupported file type. Use PDF, DOCX, or TXT.")

    if not text or not text.strip():
        raise HTTPException(422, "No extractable text found in the document")

    increment_search_count()
    return run_search(text)


def _extract_pdf(content):
    try:
        import io
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        try:
            import pdfplumber
            import io
            text = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    text.append(page.extract_text() or "")
            return "\n".join(text)
        except Exception:
            return ""


def _extract_docx(content):
    try:
        from docx import Document
        import io
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


# ── GET /api/standards/{is_number} ──
@router.get("/standards/{is_number}")
def get_standard(is_number: str):
    row = _get_standard_by_number(is_number)
    if not row:
        raise HTTPException(404, "Standard not found")
    resolved = related_rules.resolve_references(row.get("normative_references") or [])
    data = dict(row)
    data["normative_references_resolved"] = resolved
    data["related_standards"] = related_rules.compute_related_standards(is_number, limit=5)
    return data


# ── POST /api/certification-check ──
@router.post("/certification-check")
def certification_check(req: CertificationCheckRequest):
    match = cert_rules.lookup_product(req.product_name)
    if not match:
        return {
            "found": False,
            "product_name": req.product_name,
            "message": "No matching product found in the certification rules. "
                       "Certification status could not be established from the configured knowledge base.",
        }
    return {
        "found": True,
        "product_name": match["product_name"],
        "is_qco_mandatory": match["is_qco_mandatory"],
        "applicable_is_number": match["applicable_is_number"],
        "enforcement_date": str(match["enforcement_date"]) if match.get("enforcement_date") else None,
        "aliases": match["aliases"],
    }


# ── POST /api/reviews ──
@router.post("/reviews")
def create_review(req: ReviewCreate):
    if req.decision not in ("accept", "reject", "flag"):
        raise HTTPException(400, "decision must be accept, reject, or flag")
    conn = database.get_connection()
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO reviews (request_id, is_number, decision) VALUES (%s,%s,%s) RETURNING *",
                (req.request_id, req.is_number, req.decision),
            )
            row = cur.fetchone()
    finally:
        conn.close()
    return dict(row)


# ── GET /api/reviews/{request_id} ──
@router.get("/reviews/{request_id}")
def get_reviews(request_id: str):
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT request_id, is_number, decision, reviewed_at FROM reviews WHERE request_id = %s ORDER BY id",
                (request_id,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return {"request_id": request_id, "reviews": [dict(r) for r in rows]}


# ── POST /api/export/{request_id} ──
@router.post("/export/{request_id}", response_class=PlainTextResponse)
def export(request_id: str):
    # Fetch accepted standards for this request from reviews
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT is_number FROM reviews WHERE request_id = %s AND decision = 'accept'", (request_id,)
            )
            accepted = [row["is_number"] for row in cur.fetchall()]
    finally:
        conn.close()

    lines = ["═" * 60]
    lines.append("MANAK-AI — TENDER-READY STANDARDS REFERENCE BLOCK")
    lines.append("Recommendation engine for Indian Standards in procurement")
    lines.append("═" * 60)
    lines.append("")
    lines.append(f"Request ID: {request_id}")
    lines.append(f"Generated:  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append("NOTE: AI-assisted recommendations — verify all references before use.")
    lines.append("")

    if not accepted:
        lines.append("No accepted standards recorded for this request.")
        lines.append("")
        return "\n".join(lines)

    for idx, is_num in enumerate(accepted, start=1):
        row = _get_standard_by_number(is_num)
        if not row:
            continue
        lines.append("─" * 60)
        lines.append(f"{idx}. {row['is_number']} — {row['title']}")
        lines.append("─" * 60)
        lines.append(f"   Category:      {row['category']}")
        lines.append(f"   Sub-category:  {row['sub_category'] or 'N/A'}")
        lines.append(f"   Version:       {row['version'] or 'N/A'}")
        lines.append(f"   Last amended:  {row['last_amended'] or 'N/A'}")
        lines.append("")
        lines.append("   SCOPE:")
        lines.append("   " + (row['scope'] or 'N/A').replace("\n", "\n   "))
        lines.append("")
        lines.append(f"   QCO mandatory: {'YES' if row['is_qco_mandatory'] else 'NO'}")
        if row.get("qco_enforcement_date"):
            lines.append(f"   Enforcement:   {row['qco_enforcement_date']}")
        lines.append("")

    lines.append("═" * 60)
    return "\n".join(lines)


# ── GET /api/dashboard/stats ──
@router.get("/dashboard/stats")
def dashboard_stats():
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS c FROM standards")
            std_count = cur.fetchone()["c"]
            # QCO deadlines in next 30 days from certification_rules
            cur.execute(
                """SELECT COUNT(*) AS c FROM certification_rules
                   WHERE enforcement_date IS NOT NULL
                     AND enforcement_date >= CURRENT_DATE
                     AND enforcement_date <= (CURRENT_DATE + INTERVAL '30 days')"""
            )
            qco_30 = cur.fetchone()["c"]
            # Deadline details
            cur.execute(
                """SELECT product_name, applicable_is_number, enforcement_date
                   FROM certification_rules
                   WHERE enforcement_date IS NOT NULL
                     AND enforcement_date >= CURRENT_DATE
                     AND enforcement_date <= (CURRENT_DATE + INTERVAL '30 days')
                   ORDER BY enforcement_date"""
            )
            details = cur.fetchall()
    finally:
        conn.close()

    return {
        "total_searches_session": get_search_count(),
        "total_standards": std_count,
        "qco_deadlines_next_30d": qco_30,
        "qco_deadline_details": [
            {"product_name": d["product_name"],
             "applicable_is_number": d["applicable_is_number"],
             "enforcement_date": str(d["enforcement_date"])}
            for d in details
        ],
    }
