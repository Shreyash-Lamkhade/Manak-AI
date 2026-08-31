# MANAK-AI — Evidence-backed Indian Standards Recommendation Engine

An evidence-backed recommendation engine that helps procurement officials discover and
review potentially applicable Indian Standards (IS) for procurement specifications. This
MVP is **fast, deterministic, and uses no LLM and no web scraping** — it relies on a single
sentence-transformers embedding model, a PostgreSQL + pgvector database, and mock data
seeded from JSON files.

---

## What it does

- Takes a product / tender specification (text or an uploaded PDF / DOCX / TXT).
- Embeds the query with **all-MiniLM-L6-v2** (loaded once at startup, no LLM).
- Runs a **cosine-similarity pgvector** query against a standards table (top 10).
- Reranks deterministically using three sub-scores:
  - **semantic similarity** (pgvector)
  - **keyword overlap** (query words vs title + scope, regex/spec-aware)
  - **specification match** (extracts things like `100W`, `IP65`, `53 grade` and compares
    to the standard's specifications)
- Combines them into one relevance score out of 100 and returns the **top 5**.
- Builds an **evidence object** (stored `source_excerpt`, matched spec values, overlapping
  keywords) and a **template explanation** (never an LLM).
- Resolves **normative references** into full titles, computes **related standards**
  (share at least one normative reference — a real DB query), and returns **version /
  amendment** info from the stored record.
- Offers a separate, fully deterministic **certification check** endpoint that looks up a
  product by name/aliases in the certification rules.
- **Abstains** when the top result's score is below a threshold (default 40) instead of
  forcing a recommendation.
- Records **accept / reject / flag** reviews and can **export** a tender-ready block of the
  accepted standards.

---

## Repository layout

```
backend/
  app/
    api/routes.py          # all API endpoints
    core/                  # config + database (pgvector)
    schemas/               # pydantic response models
    services/              # embedding + search pipeline
    retrieval/             # vector_search + deterministic rerank/scoring
    rules/                 # certification lookup + related/reference resolution
    evidence/              # evidence + template explanation builder
  scripts/seed.py          # create schema + seed from JSON on startup (idempotent)
  data/standards.json      # 63 standards across 8 categories
  data/certification_rules.json  # 31 certification rules
  tests/                   # unit tests for scoring/rules/abstention
  Dockerfile
  requirements.txt
docker-compose.yml         # postgres (pgvector) + backend
src/                       # existing React + TypeScript + Tailwind frontend
```

---

## Run it (one command for DB + backend)

Prerequisites: Docker and Docker Compose.

```bash
docker compose up --build
```

This starts two services:

1. **db** — `pgvector/pgvector:pg16` (PostgreSQL with the `vector` extension ready to go).
2. **backend** — FastAPI app on `http://localhost:8000`. On startup it creates the tables
   (`standards`, `certification_rules`, `reviews`), seeds them from the JSON files on first
   run (skips reseeding if rows already exist), downloads the embedding model once, and
   embeds `title + scope` of every standard.

### Run the frontend

In a second terminal:

```bash
npm install        # first time only
npm run dev        # starts Vite on http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:8000`, so the app talks to the backend directly.

> If you only want to run the frontend in dev mode against the backend, `npm run dev`
> (Vite) is enough. For a production build, `npm run build` produces a static `dist/`.

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/search` | Full search pipeline on query text. |
| POST | `/api/search/document` | Upload PDF/DOCX/TXT, extract text, run the same pipeline. |
| GET | `/api/standards/{is_number}` | Full record with resolved normative references + related standards. |
| POST | `/api/certification-check` | Deterministic product → certification lookup. |
| POST | `/api/reviews` | Store accept / reject / flag decision. |
| GET | `/api/reviews/{request_id}` | Decisions recorded for a request. |
| POST | `/api/export/{request_id}` | Plain-text tender-ready block of accepted standards. |
| GET | `/api/dashboard/stats` | Session searches, total standards, QCO deadlines in next 30 days. |
| GET | `/api/health` | Health check. |

Interactive API docs are at `http://localhost:8000/docs`.

---

## Example queries that produce good results

These are known to rank well against the seeded corpus:

1. **`LED street light 100W IP65 outdoor`**
   → top result: **IS 10322 (Part 5/Sec 4):2018** — road & street lighting luminaires.
   The `IP65` specification matches directly; strong keyword overlap on "street light".

2. **`Portland cement OPC 53 grade`**
   → top result: **IS 269:2015** — Ordinary Portland Cement. Strong keyword + title match.

3. **`concrete mix design M20 reinforced concrete`**
   → top results: **IS 456:2000** (plain/reinforced concrete) and **IS 10262:2019**
   (mix proportioning) — with related standards IS 383 / IS 516.

4. **`PVC insulated cables 1100V wiring`** → **IS 694:2010**.

A deliberately unrelated query (e.g. `quantum computing hardware`) will return an
**abstain** response rather than a forced top result.

---

## Configuration

Environment variables (see `docker-compose.yml` for backend defaults):

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://manak:manak@db:5432/manak_ai` | Postgres/pgvector connection. |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | The single embedding model. |
| `ABSTAIN_THRESHOLD` | `40` | Relevance score below which we abstain. |
| `VECTOR_TOP_K` | `10` | Candidates pulled from vector search. |
| `FINAL_TOP_K` | `5` | Final results returned. |

---

## Tests

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # (Windows) create venv
pip install -r requirements.txt pytest
pytest tests/ -q
```

Tests cover the deterministic scoring, spec extraction, evidence building, and abstention
logic and do not require Docker.

---

## Notes on data

All standards and certification rules are **mock/curated demo data** for the hackathon MVP,
clearly labelled as such. They are not authoritative BIS data. The system positions results
as *evidence-backed recommendations for human review*, not autonomous determinations. QCO /
certification applicability should always be verified against official DPIIT / BIS sources.
