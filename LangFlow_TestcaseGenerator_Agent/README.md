# LangFlow Test Case Generator

Turn a **user story** into **test cases** using [Langflow](https://www.langflow.org/). Paste your story in chat; the AI returns one **HTML table** with 10+ test cases.

---

## What is this?

One file: **`Testcase_Generator.json`** — a Langflow flow named **`Testcase_Generator`** (built for Langflow **1.8.2**).

No Python or extra code here. Import the JSON into Langflow and use the Playground.

---

## How it works

| Step | Component | Role |
|------|-----------|------|
| 1 | **Chat Input** | You paste the user story |
| 2 | **Prompt Template** | Adds QA rules (format, types, IDs) |
| 3 | **Groq** | AI writes the test cases |
| 4 | **Chat Output** | Shows the HTML table |

```
User story  →  Prompt  →  Groq (LLM)  →  HTML table
```

The AI acts like a **Senior QA Engineer**: positive, negative, edge, boundary, and validation cases.

---

## What you need

- **Langflow** installed (version **1.8.x** recommended)
- **Groq API key** — get one at [console.groq.com](https://console.groq.com)  
  Set it in the **Groq** node (or as `GROQ_API_KEY` in Langflow settings)

Default model in the flow: **`llama-3.1-8b-instant`** (you can switch to `llama-3.3-70b-versatile` for better quality).

---

## Quick start

1. Open Langflow → **Import** → choose `Testcase_Generator.json`.
2. Open the flow **Testcase_Generator**.
3. Click the **Groq** node and add your API key.
4. Open **Playground**, paste a user story, and send.
5. Copy the HTML table from the reply. Review and edit before using in real testing.

---

## Example input

```text
As a user, I want to reset my password by email,
so that I can log in again if I forget it.

Acceptance criteria:
- Reset link from login page
- Link expires in 24 hours
- Password at least 8 characters
```

---

## What you get back

One HTML table with columns like: Test Case ID, Scenario, Steps, Expected Result, Priority, Type, and more.

**Rules the AI follows:**

- At least **10** test cases
- IDs: **TC001**, **TC002**, … (not TC101 or custom prefixes)
- **One table only** — no markdown, JSON, or extra text
- Types: Positive, Negative, Edge, Boundary, Validation

---

## Tips

- Add **clear acceptance criteria** in your story for better negative/edge cases.
- **One story per message** works best.
- If the table is cut off, try a larger model or increase max tokens on the Groq node.
- Always **review** AI output before adding to Jira, Excel, or your test tool.

---

## Files

| File | Purpose |
|------|---------|
| `Testcase_Generator.json` | Langflow flow export |

Everything runs inside Langflow — no scripts to install in this folder.
