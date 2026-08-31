"""Tests for evidence building and abstention (no DB / no LLM)."""
import json
import os
import sys
import types

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Mock the embedding module so vector_search / search_service import without
# requiring sentence-transformers to be installed.
_mock_embedding = types.ModuleType("app.services.embedding")
_mock_embedding.embed_query = lambda t: [0.1] * 384
_mock_embedding.embed_texts = lambda xs: [[0.1] * 384 for _ in xs]
sys.modules["app.services.embedding"] = _mock_embedding

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def _load(name):
    with open(os.path.join(DATA_DIR, name), "r", encoding="utf-8") as f:
        return json.load(f)


def test_evidence_builder():
    from app.evidence import builder
    std = {"source_excerpt": "\"a test excerpt\""}
    ev = builder.build_evidence(std, [{"value": "IP65"}], ["led"])
    assert ev["source_excerpt"] == "\"a test excerpt\""
    assert ev["matched_specifications"][0]["value"] == "IP65"


def test_explanation_with_spec_value():
    from app.evidence import builder
    std = {"is_qco_mandatory": True}
    matched = [{"value": "IP65", "field": "ip_rating", "stored": "ip_rating: IP65"}]
    text = builder.generate_explanation(std, matched, ["led", "street"], 60, 50, 0.8)
    assert "IP65" in text
    assert "QCO" in text or "mandatory" in text


def test_abstention_below_threshold(monkeypatch):
    from app.services import search_service
    from app.core import config

    # Force the vector search to return a single low-relevance candidate.
    data = _load("standards.json")
    weak = next(s for s in data if "456" in s["is_number"])
    candidates = [dict(weak, similarity=0.15)]

    import app.retrieval.vector_search as vsmod
    monkeypatch.setattr(vsmod, "vector_search", lambda q, top_k=None: candidates)

    from app.rules import related as relmod
    monkeypatch.setattr(relmod, "resolve_references", lambda x: [])
    monkeypatch.setattr(relmod, "compute_related_standards", lambda i, limit=5: [])

    config.ABSTAIN_THRESHOLD = 40.0
    resp = search_service.run_search("some unrelated query that has no matching standard")
    # Because the only candidate is a weak concrete standard for an unrelated query,
    # the deterministic rerank should keep its score below threshold.
    assert resp.abstained


def test_mock_search_service_returns_request_id_and_normative_refs_for_all_run_results():
    from app.services import search_service
    import app.retrieval.vector_search as vsmod
    data = _load("standards.json")
    target = next(s for s in data if "10322" in s["is_number"])
    vsmod.vector_search = lambda q, top_k=None: [dict(target, similarity=0.8)]
    from app.rules import related as relmod
    relmod.resolve_references = lambda x: [{"is_number": n, "title": "T", "category": "C"} for n in (x or [])]
    relmod.compute_related_standards = lambda i, limit=5: [{"is_number": "IS 1", "title": "R", "category": "C"}]

    resp = search_service.run_search("LED street light IP65")
    assert resp.request_id
    assert len(resp.results) == 1
    r = resp.results[0]
    assert r.normative_references
    assert r.related_standards
    assert r.version_info.version is not None
    assert r.certification["is_qco_mandatory"] in (True, False)
