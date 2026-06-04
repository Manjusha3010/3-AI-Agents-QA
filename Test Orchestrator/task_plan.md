# Task Plan — Test Orchestrator

## Phases

### B — Blueprint

- [x] Define schemas and rules in `gemini.md`
- [x] Map UI to routes from `UI_Screenshots/`

### L — Link

- [x] `tools/verify_jira_link.py` — minimal Jira handshake
- [x] `tools/verify_llm_link.py` — minimal LLM handshake (Groq/Ollama/Gemini)

### A — Architect

- [x] SOPs under `architecture/`
- [x] FastAPI routers + services
- [x] React SPA with sidebar layout

### S — Stylize

- [x] Tailwind-based UI aligned with wireframes (cards, table, code panel)

### T — Trigger

- [ ] Deploy to cloud (out of scope for local repo)

## Checklist

- [ ] User supplies real Jira + LLM keys for end-to-end validation
