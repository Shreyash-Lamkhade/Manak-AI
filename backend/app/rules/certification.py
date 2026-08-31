"""Deterministic certification-rule lookup (independent of semantic search)."""
from app.core import database


def lookup_product(product_name: str):
    """
    Match a product name (or its substring) against certification_rules by
    product_name and aliases. Fully deterministic.

    Returns a dict or None.
    """
    query = (product_name or "").strip().lower()
    if not query:
        return None

    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM certification_rules ORDER BY id")
            rows = cur.fetchall()
    finally:
        conn.close()

    for row in rows:
        name = (row["product_name"] or "").lower()
        aliases = [a.lower() for a in (row["aliases"] or [])]
        all_terms = [name] + aliases
        # Direct contains match either direction
        for term in all_terms:
            if term and (term in query or query in term):
                return row
        # Fuzzy: most query words appear in the name/aliases combined text
        query_words = [w for w in query.split() if len(w) > 2]
        if query_words:
            combined = " ".join(all_terms)
            hits = [w for w in query_words if w in combined]
            if len(hits) >= max(1, int(len(query_words) * 0.6)):
                return row
    return None
