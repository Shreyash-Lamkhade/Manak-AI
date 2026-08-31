"""Database connection and schema helpers."""
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from app.core import config

CREATE_SCHEMA_SQL = """
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS standards (
    id SERIAL PRIMARY KEY,
    is_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    scope TEXT,
    specifications JSONB,
    normative_references TEXT[],
    is_qco_mandatory BOOLEAN DEFAULT FALSE,
    qco_enforcement_date DATE,
    version TEXT,
    last_amended DATE,
    amendment_history JSONB,
    source_excerpt TEXT,
    embedding vector(%(dim)s)
);

CREATE TABLE IF NOT EXISTS certification_rules (
    id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    is_qco_mandatory BOOLEAN DEFAULT FALSE,
    applicable_is_number TEXT,
    enforcement_date DATE
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    request_id TEXT NOT NULL,
    is_number TEXT NOT NULL,
    decision TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);
"""


def get_connection():
    return psycopg2.connect(config.DATABASE_URL, cursor_factory=RealDictCursor)


def init_schema():
    """Create tables and the vector extension if they don't exist."""
    conn = get_connection()
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute(CREATE_SCHEMA_SQL, {"dim": config.EMBEDDING_DIM})
        print("✓ Schema verified (vector extension + tables present)")
    finally:
        conn.close()
