"""Application configuration via environment variables."""
import os


# DATABASE_URL is overridden in docker-compose; local default points to the
# pgvector container on localhost.
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://manak:manak@localhost:5432/manak_ai",
)

DATA_DIR = os.environ.get(
    "DATA_DIR",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"),
)

STANDARDS_FILE = os.path.join(DATA_DIR, "standards.json")
CERTIFICATION_RULES_FILE = os.path.join(DATA_DIR, "certification_rules.json")

EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Relevance threshold (0-100) below which we abstain.
ABSTAIN_THRESHOLD = float(os.environ.get("ABSTAIN_THRESHOLD", "40"))

# Number of candidates pulled from the vector search, then trimmed to final.
VECTOR_TOP_K = int(os.environ.get("VECTOR_TOP_K", "10"))
FINAL_TOP_K = int(os.environ.get("FINAL_TOP_K", "5"))

EMBEDDING_DIM = int(os.environ.get("EMBEDDING_DIM", "384"))
