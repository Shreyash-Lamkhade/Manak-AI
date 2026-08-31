"""Full search pipeline: retrieve, rerank, enrich, build evidence, abstain."""
import uuid

from app.core import config, database
from app.retrieval import vector_search, rerank
from app.rules import related as related_rules, certification as cert_rules
from app.evidence import builder as evidence_builder
from app.schemas import (
    SearchResponse, StandardResult, Evidence, NormativeReference,
    RelatedStandard, VersionInfo, Amendment,
)


def _version_info(row):
    history = []
    for a in (row.get("amendment_history") or []):
        if isinstance(a, dict):
            history.append(Amendment(
                amendment_number=a.get("amendment_number", ""),
                date=a.get("date", ""),
                description=a.get("description", ""),
            ))
    last = row.get("last_amended")
    return VersionInfo(
        version=row.get("version"),
        last_amended=str(last) if last else None,
        amendment_history=history,
    )


def _cert_info(row):
    return {
        "status": "REQUIRED" if row.get("is_qco_mandatory") else "NOT_IDENTIFIED",
        "is_qco_mandatory": bool(row.get("is_qco_mandatory")),
        "applicable_is_number": row.get("is_number"),
        "enforcement_date": str(row["qco_enforcement_date"]) if row.get("qco_enforcement_date") else None,
        "scheme": "BIS Product Certification / CRS" if row.get("is_qco_mandatory") else None,
    }


def run_search(query_text: str):
    """
    Runs the whole pipeline and returns a SearchResponse.
    """
    request_id = uuid.uuid4().hex[:12]
    query_text = (query_text or "").strip()

    # 1. Vector retrieval (top 10)
    candidates = vector_search.vector_search(query_text)
    if not candidates:
        return _abstain(request_id, query_text)

    query_tokens = rerank.tokenize(query_text)
    query_specs = rerank.extract_specs(query_text)

    # 2. Deterministic reranking of top-10
    scored = []
    for c in candidates:
        kw_score = rerank.keyword_overlap_score(query_tokens, c)
        spec_score, matched = rerank.specification_match_score(query_specs, c)
        final_score, sim_100 = rerank.combine_scores(c["similarity"], kw_score, spec_score)
        scored.append({
            "row": c,
            "sim": c["similarity"],
            "sim_100": sim_100,
            "kw": kw_score,
            "spec": spec_score,
            "final": final_score,
            "matched_specs": matched,
        })

    scored.sort(key=lambda s: s["final"], reverse=True)
    top = scored[:config.FINAL_TOP_K]

    # 3. Abstention check
    if top and top[0]["final"] < config.ABSTAIN_THRESHOLD:
        return _abstain(request_id, query_text)

    results = []
    for rank, item in enumerate(top, start=1):
        row = item["row"]
        # Related info
        resolved = related_rules.resolve_references(row.get("normative_references") or [])
        related = related_rules.compute_related_standards(row["is_number"], limit=5)
        # Overlapping keywords
        row_toks = set(rerank.tokenize(row["title"] + " " + (row.get("scope") or "")))
        overlapping = sorted(set(query_tokens) & row_toks)
        # Evidence + explanation
        evidence = Evidence(
            source_excerpt=row.get("source_excerpt") or "",
            matched_specifications=item["matched_specs"],
            overlapping_keywords=overlapping,
        )
        explanation = evidence_builder.generate_explanation(
            row, item["matched_specs"], overlapping,
            item["kw"], item["spec"], item["sim"],
        )
        results.append(StandardResult(
            rank=rank,
            is_number=row["is_number"],
            title=row["title"],
            category=row["category"],
            sub_category=row.get("sub_category"),
            scope=row.get("scope") or "",
            relevance_score=item["final"],
            similarity_score=item["sim_100"],
            keyword_score=item["kw"],
            specification_score=item["spec"],
            is_qco_mandatory=bool(row.get("is_qco_mandatory")),
            qco_enforcement_date=str(row["qco_enforcement_date"]) if row.get("qco_enforcement_date") else None,
            evidence=evidence,
            explanation=explanation,
            normative_references=[
                NormativeReference(**r) for r in resolved
            ],
            related_standards=[
                RelatedStandard(
                    is_number=r["is_number"],
                    title=r.get("title"),
                    category=r.get("category"),
                ) for r in related
            ],
            version_info=_version_info(row),
            certification=_cert_info(row),
        ))

    return SearchResponse(
        request_id=request_id,
        query=query_text,
        abstained=False,
        abstention_reason=None,
        results=results,
        threshold=config.ABSTAIN_THRESHOLD,
    )


def _abstain(request_id, query_text):
    return SearchResponse(
        request_id=request_id,
        query=query_text,
        abstained=True,
        abstention_reason=(
            "No confident match was found for this query against the available "
            "standards corpus. Manual research is recommended before referencing "
            "any standard in a tender specification."
        ),
        results=[],
        threshold=config.ABSTAIN_THRESHOLD,
    )


# Session counter for dashboard stats (total searches this session)
_search_count = {"n": 0}


def increment_search_count():
    _search_count["n"] += 1


def get_search_count():
    return _search_count["n"]
