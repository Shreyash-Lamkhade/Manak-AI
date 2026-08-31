"""End-to-end HTTP smoke test of the FastAPI routes.

Uses the REAL search pipeline with mocked DB rows / vector search, verifying route
handlers, request validation, response serialization, and export text — all without a
live Postgres / pgvector server (which would require Docker).
"""
import io
import json
import os
import sys
import types

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND)
DATA_DIR = os.path.join(BACKEND, "data")

# ---- Mock embedding module (avoid sentence-transformers) ----
_mock_embedding = types.ModuleType("app.services.embedding")
_mock_embedding.embed_query = lambda t: [0.1] * 384
_mock_embedding.embed_texts = lambda xs: [[0.1] * 384 for _ in xs]
sys.modules["app.services.embedding"] = _mock_embedding


class _Row(dict):
    """dict subclass mimicking psycopg2 RealDictRow (subscriptable + attribute access)."""
    def __init__(self, d):
        super().__init__(d)
        self.__dict__ = self


def _load_standards():
    with open(os.path.join(DATA_DIR, "standards.json"), "r", encoding="utf-8") as f:
        return json.load(f)


# Shared per-test state
STD_ROWS = {}          # is_number -> row (for detail/export)
REVIEWS_ACCEPTED = []  # is_numbers accepted for this request
CERT_MATCH = None
RULES_ROWS = []


def _fake_cursor():
    class Cur:
        def __init__(self):
            self._rows = []
            self._sql = ""

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def execute(self, sql, params=None):
            self._sql = sql
            if "FROM standards WHERE is_number" in sql and params:
                std = STD_ROWS.get(params[0])
                self._rows = [std] if std else []
            elif "COUNT(*) AS c FROM standards" in sql:
                self._rows = [_Row({"c": len(STD_ROWS)})]
            elif "INSERT INTO reviews" in sql:
                self._rows = [_Row({"request_id": params[0], "is_number": params[1], "decision": params[2]})]
            elif "decision = 'accept'" in sql:
                self._rows = [_Row({"is_number": i}) for i in REVIEWS_ACCEPTED]
            elif "COUNT(*) AS c FROM certification_rules" in sql:
                self._rows = [_Row({"c": len(RULES_ROWS)})]
            elif "FROM certification_rules" in sql:
                self._rows = RULES_ROWS
            else:
                self._rows = []
            return self

        def fetchone(self):
            return self._rows[0] if self._rows else None

        def fetchall(self):
            return self._rows

    return Cur()


def _fake_connection():
    conn = types.SimpleNamespace()
    conn.autocommit = False
    conn.cursor = _fake_cursor
    conn.close = lambda: None
    return conn


def _build_app(monkeypatch):
    import app.core.database as db
    monkeypatch.setattr(db, "get_connection", _fake_connection)

    import app.retrieval.vector_search as vsmod
    def _fake_vector_search(q, top_k=None):
        return [{**s, "similarity": 0.8} for s in STD_ROWS.values()]
    monkeypatch.setattr(vsmod, "vector_search", _fake_vector_search)

    import app.rules.related as relmod
    monkeypatch.setattr(relmod, "resolve_references", lambda refs: [{"is_number": n, "title": "T", "category": "C"} for n in (refs or [])])
    monkeypatch.setattr(relmod, "compute_related_standards", lambda i, limit=5: [])

    import app.rules.certification as certmod
    monkeypatch.setattr(certmod, "lookup_product", lambda name: CERT_MATCH)

    from fastapi import FastAPI
    from app.api.routes import router
    app = FastAPI()
    app.include_router(router, prefix="/api")
    from fastapi.testclient import TestClient
    return TestClient(app)


def test_search_endpoint(monkeypatch):
    global STD_ROWS
    STD_ROWS = {s["is_number"]: s for s in _load_standards()}
    client = _build_app(monkeypatch)
    r = client.post("/api/search", json={"query": "LED street light IP65"})
    assert r.status_code == 200
    body = r.json()
    assert body["abstained"] is False
    assert len(body["results"]) >= 1
    top = body["results"][0]
    assert "is_number" in top and top["is_number"]
    assert top["evidence"]["matched_specifications"] is not None
    assert top["version_info"]["version"] is not None
    assert "status" in top["certification"]


def test_search_empty_query_400(monkeypatch):
    client = _build_app(monkeypatch)
    r = client.post("/api/search", json={"query": "   "})
    assert r.status_code == 400


def test_document_search_txt(monkeypatch):
    client = _build_app(monkeypatch)
    r = client.post(
        "/api/search/document",
        files={"document": ("spec.txt", io.BytesIO(b"LED street light IP65 outdoor luminaire"), "text/plain")},
    )
    assert r.status_code == 200
    assert r.json()["abstained"] is False
    assert len(r.json()["results"]) >= 1


def test_document_unsupported_type_400(monkeypatch):
    client = _build_app(monkeypatch)
    r = client.post(
        "/api/search/document",
        files={"document": ("spec.xyz", io.BytesIO(b"hello"), "application/octet-stream")},
    )
    assert r.status_code == 400


def test_standards_detail(monkeypatch):
    global STD_ROWS
    STD_ROWS = {s["is_number"]: s for s in _load_standards()}
    key = next(k for k in STD_ROWS if "269" in k)
    client = _build_app(monkeypatch)
    r = client.get(f"/api/standards/{key.replace('/', '%2F').replace(':', '%3A').replace(' ', '%20')}")
    assert r.status_code == 200
    body = r.json()
    assert body["is_number"] == key
    assert "normative_references_resolved" in body
    assert "related_standards" in body


def test_standards_detail_404(monkeypatch):
    global STD_ROWS
    STD_ROWS = {}
    client = _build_app(monkeypatch)
    r = client.get("/api/standards/DOESNOTEXIST:1")
    assert r.status_code == 404


def test_certification_check_found(monkeypatch):
    global CERT_MATCH
    CERT_MATCH = {
        "product_name": "LED street light",
        "is_qco_mandatory": True,
        "applicable_is_number": "IS 10322:2018",
        "enforcement_date": "2025-06-01",
        "aliases": ["street light"],
    }
    client = _build_app(monkeypatch)
    r = client.post("/api/certification-check", json={"product_name": "LED street light"})
    assert r.status_code == 200
    assert r.json()["found"] is True
    assert r.json()["is_qco_mandatory"] is True


def test_certification_check_not_found(monkeypatch):
    global CERT_MATCH
    CERT_MATCH = None
    client = _build_app(monkeypatch)
    r = client.post("/api/certification-check", json={"product_name": "banana"})
    assert r.status_code == 200
    assert r.json()["found"] is False


def test_reviews_post_and_validate(monkeypatch):
    client = _build_app(monkeypatch)
    r = client.post("/api/reviews", json={"request_id": "req-1", "is_number": "IS 1", "decision": "accept"})
    assert r.status_code == 200
    assert r.json()["decision"] == "accept"
    r = client.post("/api/reviews", json={"request_id": "req-1", "is_number": "IS 1", "decision": "bogus"})
    assert r.status_code == 400
    r = client.get("/api/reviews/req-1")
    assert r.status_code == 200
    assert r.json()["request_id"] == "req-1"


def test_export(monkeypatch):
    global STD_ROWS, REVIEWS_ACCEPTED
    STD_ROWS = {s["is_number"]: s for s in _load_standards()}
    key = next(k for k in STD_ROWS if "269" in k)
    REVIEWS_ACCEPTED = [key]
    client = _build_app(monkeypatch)
    r = client.post("/api/export/req-1")
    assert r.status_code == 200
    assert "TENDER-READY STANDARDS REFERENCE BLOCK" in r.text
    assert key in r.text


def test_dashboard_stats(monkeypatch):
    global STD_ROWS, RULES_ROWS
    STD_ROWS = {s["is_number"]: s for s in _load_standards()}
    RULES_ROWS = [_Row({
        "product_name": "LED street light", "applicable_is_number": "IS 10322:2018",
        "enforcement_date": "2025-06-01",
    })]
    client = _build_app(monkeypatch)
    r = client.get("/api/dashboard/stats")
    assert r.status_code == 200
    body = r.json()
    assert body["total_standards"] == len(STD_ROWS)
    assert body["qco_deadlines_next_30d"] == 1
    assert body["qco_deadline_details"][0]["product_name"] == "LED street light"
