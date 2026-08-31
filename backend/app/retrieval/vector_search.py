"""pgvector cosine-similarity retrieval against the standards table."""
from app.core import config, database
from app.services import embedding


def vector_search(query_text: str, top_k: int = None):
    """Embed the query and return top_k candidates by cosine similarity.

    Returns list of dicts with the standard fields plus similarity_score.
    """
    top_k = top_k or config.VECTOR_TOP_K
    query_vec = embedding.embed_query(query_text)

    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                  is_number, title, category, sub_category, scope,
                  specifications, normative_references, is_qco_mandatory,
                  qco_enforcement_date, version, last_amended,
                  amendment_history, source_excerpt,
                  1 - (embedding <=> %s::vector) AS similarity
                FROM standards
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (query_vec, query_vec, top_k),
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    # Ensure similarity is a float
    for r in rows:
        r["similarity"] = float(r["similarity"])
    return rows
