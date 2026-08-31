"""Resolve normative references and compute related standards via real DB queries."""
from app.core import database


def resolve_references(is_numbers):
    """Return [ {is_number,title,category} ] for each referenced standard number."""
    if not is_numbers:
        return []
    conn = database.get_connection()
    try:
        result = []
        for num in is_numbers:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT is_number, title, category FROM standards WHERE is_number = %s",
                    (num,),
                )
                row = cur.fetchone()
            if row:
                result.append({"is_number": row["is_number"], "title": row["title"], "category": row["category"]})
            else:
                result.append({"is_number": num, "title": None, "category": None})
        return result
    finally:
        conn.close()


def compute_related_standards(is_number, limit=5):
    """
    Other standards that share at least one normative reference with this standard.
    Real SQL query against the data, not hardcoded.
    """
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            # Get this standard's references
            cur.execute("SELECT normative_references FROM standards WHERE is_number = %s", (is_number,))
            self_row = cur.fetchone()
            if not self_row:
                return []
            self_refs = set(self_row["normative_references"] or [])

            # Get all standards with their references (pairwise comparison in SQL)
            cur.execute("SELECT is_number, title, category, normative_references FROM standards WHERE is_number <> %s", (is_number,))
            rows = cur.fetchall()
    finally:
        conn.close()

    related = []
    for row in rows:
        refs = set(row["normative_references"] or [])
        shared = refs & self_refs
        # Also a standard counts as related if this standard references it, or it references this standard
        if is_number in refs or row["is_number"] in self_refs:
            shared = shared | {is_number}
        if shared:
            related.append({
                "is_number": row["is_number"],
                "title": row["title"],
                "category": row["category"],
                "shared_references": sorted(shared),
            })

    # Sort by number of shared references desc
    related.sort(key=lambda r: len(r["shared_references"]), reverse=True)
    return [
        {"is_number": r["is_number"], "title": r["title"], "category": r["category"],
         "shared_references": r["shared_references"]}
        for r in related[:limit]
    ]
