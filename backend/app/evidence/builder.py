"""Evidence construction and template-based explanation generation (no LLM)."""


def build_evidence(standard, matched_specs, overlapping_keywords):
    """Build the evidence object from stored source_excerpt + matched values."""
    return {
        "source_excerpt": standard.get("source_excerpt") or "",
        "matched_specifications": matched_specs,
        "overlapping_keywords": overlapping_keywords,
    }


def generate_explanation(standard, matched_specs, overlapping_keywords,
                         keyword_score, specification_score, similarity_score):
    """
    Generate plain template text grounded in the values that produced the match.
    matched_specs entries are {"value": raw, "field": key, "stored": "key: val"}.
    Never calls any external AI API.
    """
    parts = []

    # Values the query specified that matched this standard's specifications
    query_values = []
    for m in matched_specs:
        v = m.get("value")
        if v and v not in query_values:
            query_values.append(v)

    kw_values = overlapping_keywords[:4]

    if query_values:
        vals = ", ".join(query_values)
        parts.append(f"the query specified {vals} which are present in this standard's specifications")

    if kw_values and keyword_score >= 40:
        parts.append(f"with strong keyword overlap on {', '.join(kw_values)}")

    if not parts:
        # Fallback: rely on semantic similarity only
        sim_pct = round(similarity_score * 100)
        parts.append(
            f"this standard matched based on semantic similarity to the query "
            f"(score {sim_pct}%) without specific keyword or specification overlap"
        )

    if standard.get("is_qco_mandatory"):
        parts.append("the standard is under a mandatory QCO requiring BIS certification")

    explanation = parts[0][0].upper() + parts[0][1:]
    if len(parts) > 1:
        explanation += ", and " + ", ".join(parts[1:])
    explanation += "."
    return explanation
