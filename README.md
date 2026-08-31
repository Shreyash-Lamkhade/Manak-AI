# MANAK-AI — Indian Standards Recommendation Engine

## Run in 2 commands (no Docker, no Python needed)

**Prerequisite:** Install [Node.js LTS](https://nodejs.org) — that's it.

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

To stop: `Ctrl+C`

---

## Example searches

| Query | Expected top result |
|-------|---------------------|
| `LED street light 100W IP65 outdoor` | IS 10322 |
| `Portland cement OPC 53 grade` | IS 269:2015 |
| `concrete mix design M20` | IS 456:2000 |
| `PVC insulated cables 1100V` | IS 694:2010 |

---

## How it works

- Node.js + Express backend (`server/`) serves the API on port 3000
- React + Vite frontend (`src/`) on port 5173, proxies `/api` to the backend
- All data is JSON files in `server/data/` — no database needed
- Scoring: keyword overlap + title match + specification extraction (IP ratings, wattage, grades etc.)
