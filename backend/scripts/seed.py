"""Seeding script.

On first startup it:
- creates the schema (vector extension + tables),
- loads standards.json and certification_rules.json,
- skips reseeding if the tables already have rows,
- if seeding, embeds (title + scope) of every standard and stores the vector.
"""
import json
from psycopg2.extras import Json

from app.core import config, database
from app.services import embedding


def count_rows(table):
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT COUNT(*) AS c FROM {table}")
            row = cur.fetchone()
            return row["c"]
    finally:
        conn.close()


def seed():
    database.init_schema()

    std_count = count_rows("standards")
    rule_count = count_rows("certification_rules")
    if std_count > 0 and rule_count > 0:
        print(f"✓ Tables already populated (standards={std_count}, rules={rule_count}). Skipping reseed.")
        return

    with open(config.STANDARDS_FILE, "r", encoding="utf-8") as f:
        standards = json.load(f)
    with open(config.CERTIFICATION_RULES_FILE, "r", encoding="utf-8") as f:
        rules = json.load(f)

    # Clean date fields: empty strings -> None
    for s in standards:
        s["qco_enforcement_date"] = s.get("qco_enforcement_date") or None
        s["last_amended"] = s.get("last_amended") or None

    # Build embedding texts: title + scope
    texts = [f"{s['title']}. {s['scope']}" for s in standards]
    vectors = embedding.embed_texts(texts)

    conn = database.get_connection()
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            # Standards
            for s, vec in zip(standards, vectors):
                cur.execute(
                    """
                    INSERT INTO standards
                      (is_number, title, category, sub_category, scope,
                       specifications, normative_references, is_qco_mandatory,
                       qco_enforcement_date, version, last_amended,
                       amendment_history, source_excerpt, embedding)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (is_number) DO NOTHING
                    """,
                    (
                        s["is_number"],
                        s["title"],
                        s["category"],
                        s.get("sub_category"),
                        s["scope"],
                        Json(s.get("specifications", {})),
                        s.get("normative_references", []),
                        s.get("is_qco_mandatory", False),
                        s.get("qco_enforcement_date"),
                        s.get("version"),
                        s.get("last_amended"),
                        Json(s.get("amendment_history", [])),
                        s.get("source_excerpt"),
                        vec,
                    ),
                )

            # Certification rules
            for r in rules:
                cur.execute(
                    """
                    INSERT INTO certification_rules
                      (product_name, aliases, is_qco_mandatory, applicable_is_number, enforcement_date)
                    VALUES (%s,%s,%s,%s,%s)
                    ON CONFLICT DO NOTHING
                    """,
                    (
                        r["product_name"],
                        r.get("aliases", []),
                        r.get("is_qco_mandatory", False),
                        r.get("applicable_is_number"),
                        r.get("enforcement_date") or None,
                    ),
                )
    finally:
        conn.close()

    print(f"✓ Seeded {len(standards)} standards and {len(rules)} certification rules")


if __name__ == "__main__":
    seed()
