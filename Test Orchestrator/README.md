# Test Orchestrator — Beginner Guide (v2)

A **web app** that helps QA teams go from **Jira user stories** to **test plans**, **test cases**, and **automation code** (Playwright or Selenium) — with AI doing the heavy drafting. You review and edit everything before use.

> **Full guide:** see [README.md](./README.md) for troubleshooting, dev commands, and project layout.

---

## What is this?

**Test Orchestrator** connects three things:

| Piece | Role |
|-------|------|
| **Jira** | Where your user stories live |
| **AI (LLM)** | Writes plans, cases, and code drafts |
| **Your browser** | One app to run the whole flow |

Typical path:

```
Jira story  →  Test plan  →  Test cases  →  Playwright / Selenium code
```

Nothing runs in the cloud by default — you start a **local server** on your PC and open the app in Chrome (or any browser).

---

## What you need

- **Windows** (easiest start with `START.bat`)
- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **Python** 3.11+ — [python.org](https://www.python.org)
- An **LLM API key** (Groq, Gemini, or local **Ollama**)
- Optional: **Jira** URL + email + API token (or use **sample stories** to try without Jira)

---

## Start the app (5 steps)

1. Open the **`Test Orchestrator`** folder.
2. Double-click **`START.bat`**.
3. Keep the second window open: **KEEP OPEN - Test Orchestrator (server)**.
4. Browser opens **http://127.0.0.1:8000** (if not, type it yourself).
5. To stop later: **`STOP-SERVER.bat`** or close only the KEEP OPEN window.

**Yellow bar at the top?** The server is not running — run `START.bat` again.

---

## First-time setup in the app

### 1. Settings (AI)

Sidebar → **Settings**

- Pick **Provider**: Groq, Gemini, or Ollama  
- Enter **API key** and **model**  
- Click **Test Connection**

### 2. Jira (stories)

Sidebar → **Jira Integration Module**

- Enter Jira URL, email, API token → **Test Connection**  
- **Fetch Stories** from your project  

**No Jira yet?** Use **Load sample stories** to explore the app.

---

## Main workflow (do this in order)

| Step | Where in app | What you do |
|------|----------------|-------------|
| 1 | **Jira Integration Module** | Pick a user story |
| 2 | Story card | Click **Generate Test Plan →** |
| 3 | **Test Plan Generator** | Read plan → **Create Test Cases from Plan** |
| 4 | **Test Case Creator** | Review / edit cases; export if needed |
| 5 | **Test Case Dashboard** | Table view, filters, bulk actions |
| 6 | **Code Generator** | Pick Playwright or Selenium → generate scripts |
| 7 | **Dashboard** | Summary KPIs for your current work |

**Switching stories?** Open **Story history** — the app saves the last few sessions (plan + cases) so you can restore them.

---

## Screens (sidebar)

| Menu | Purpose |
|------|---------|
| Dashboard | Home — stats and overview |
| Jira Integration Module | Connect Jira, list stories |
| Test Plan Generator | AI test plan for one story |
| Test Case Creator | Edit generated test cases |
| Test Case Dashboard | Spreadsheet-style case list |
| Story history | Restore older story sessions |
| Code Generator | Playwright / Selenium code |
| Settings | LLM provider and API key |

Light/dark mode: toggle at the bottom of the sidebar.

---

## How it works (under the hood, simple)

```
web/          →  React UI (what you click)
server/       →  FastAPI API (talks to Jira + AI)
START.bat     →  Builds UI, starts server, opens browser
```

- UI and API run on the **same port** (usually **8000**).
- API docs (when server is on): **http://127.0.0.1:8000/api/docs**
- Jira and LLM keys are stored in **browser localStorage** on your machine (fine for local dev; not for shared production).

---

## AI providers (pick one in Settings)

| Provider | Good for |
|----------|----------|
| **Groq** | Fast, cloud API |
| **Gemini** | Google AI models |
| **Ollama** | Run models locally (no key if local) |

---

## Code you can generate

**Code Generator** supports:

- **Playwright** — JavaScript or Python  
- **Selenium** — Python  
- Browser options as shown in the UI  

Copy the output into your test repo and adjust as needed.

---

## Tips for beginners

- Complete **Settings** before generating anything.
- Write or fetch stories with **clear acceptance criteria** — better AI output.
- Treat all AI output as a **first draft** — always review before Jira/export/automation runs.
- One story at a time is easiest; use **Story history** when you switch tickets.
- Stuck? Read **`HOW-TO-START.txt`** or **`start-error.log`** in the project folder.

---

## Quick troubleshooting

| Problem | Fix |
|---------|-----|
| Connection refused | Run `START.bat`; keep KEEP OPEN window open |
| Port busy | `STOP-SERVER.bat`, then start again |
| Jira errors | Check URL, email, token; use latest code from this repo |
| AI errors | Test connection in Settings; check key and model name |

---

## Project folders (short)

| Folder / file | What it is |
|---------------|------------|
| `web/` | Frontend (React) |
| `server/` | Backend (FastAPI) |
| `START.bat` / `STOP-SERVER.bat` | Windows shortcuts |
| `architecture/` | QA process notes (SOP) |
| `README.md` | Detailed original readme |

---

## Cheat sheet (one line)

**Settings → Jira → Generate Test Plan → Create Test Cases → Dashboard / Code Generator**

That is the whole app in one sentence.
