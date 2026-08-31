"""Unit tests for the deterministic reranking + scoring logic (no DB / no LLM)."""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.retrieval import rerank

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def load_standards():
    with open(os.path.join(DATA_DIR, "standards.json"), "r", encoding="utf-8") as f:
        return json.load(f)


def test_extract_specs_ip_and_watt():
    specs = rerank.extract_specs("LED street light 100W IP65 outdoor")
    units = [s["unit"] for s in specs]
    assert "IP" in units
    assert "W" in units
    ip = [s for s in specs if s["unit"] == "IP"][0]
    assert ip["value"] == "65"


def test_keyword_overlap_cement():
    data = load_standards()
    opc = next(s for s in data if s["is_number"] == "IS 269:2015")
    tokens = rerank.tokenize("Portland cement OPC 53 grade")
    score = rerank.keyword_overlap_score(tokens, opc)
    assert score >= 60


def test_specification_match_ip65():
    data = load_standards()
    street = next(s for s in data if "10322" in s["is_number"])
    specs = rerank.extract_specs("LED street light 100W IP65")
    score, matched = rerank.specification_match_score(specs, street)
    assert score > 0
    assert any("IP65" in m.get("value", "") for m in matched)


def test_combine_scores_ranges():
    final, sim = rerank.combine_scores(0.8, 50, 30)
    assert sim == 80.0
    assert 0 <= final <= 100


def test_no_spec_returns_zero():
    data = load_standards()
    street = next(s for s in data if "10322" in s["is_number"])
    score, matched = rerank.specification_match_score([], street)
    assert score == 0.0
    assert matched == []
