"""Sentence-transformers embedding service loaded once at startup.

Only the single configured embedding model is used (no LLM, no second model).
"""
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.core import config

_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"Loading embedding model: {config.EMBEDDING_MODEL} ...")
        _model = SentenceTransformer(config.EMBEDDING_MODEL)
        print("✓ Embedding model loaded")
    return _model


def embed_texts(texts):
    """Embed a list of strings, returning a list of float vectors."""
    model = get_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vectors]


def embed_query(text: str):
    """Embed a single query string."""
    return embed_texts([text])[0]
