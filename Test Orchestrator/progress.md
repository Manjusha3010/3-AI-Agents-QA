# Progress

## 2026-04-05

- Initialized BLAST artifacts (`gemini.md`, planning files, `architecture/`, `tools/`).
- Implemented FastAPI backend and React (Vite) frontend for Test Orchestrator v1.

### Run locally (recommended — one URL)

From the repo root in PowerShell:

`.\scripts\start.ps1`

Then open **http://127.0.0.1:8000** (UI + API same origin; no CORS/proxy issues).

Optional dev split: `cd web && npm run dev` (port 5180) + API on 8000 via `.\scripts\start-api.ps1`.

Python 3.14: use flexible `requirements.txt` (pydantic 2.12+) so wheels resolve; pinned 2.10 failed without Rust.
