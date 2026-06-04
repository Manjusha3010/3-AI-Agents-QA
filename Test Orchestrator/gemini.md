# Test Orchestrator — Project Constitution (BLAST)

## Purpose

Web application bridging Jira requirements and AI-generated test artifacts: test plans, structured test cases, and automation code (Selenium Python / Playwright).

## Architectural Invariants

1. **Layer separation:** UI (`web/`) → HTTP API (`server/`) → integrations. Business rules for external APIs live in `server/app/services/`; human procedures in `architecture/`.
2. **Secrets:** Never commit API keys. Client stores LLM/Jira credentials in browser `localStorage` for demo portability; production should use a secure vault and server-side session.
3. **LLM output:** Parsed as JSON when structured; fallback markdown displayed raw. All generation is best-effort; user can edit code in UI.

## Data Schemas

### LLMSettings

```json
{
  "provider": "groq | gemini | ollama",
  "apiKey": "string (optional for ollama local)",
  "baseUrl": "string (optional; default per provider)",
  "model": "string"
}
```

### JiraConnection

```json
{
  "jiraUrl": "https://tenant.atlassian.net",
  "email": "string",
  "apiToken": "string"
}
```

### JiraUserStory (normalized)

```json
{
  "key": "SCRUM-1",
  "summary": "string",
  "description": "string",
  "acceptanceCriteria": "string",
  "status": "string",
  "raw": {}
}
```

### TestPlan

```json
{
  "id": "string",
  "jiraKey": "string",
  "title": "string",
  "contentMarkdown": "string",
  "createdAt": "ISO-8601"
}
```

### TestCase

```json
{
  "id": "TC-KEY-n",
  "jiraKey": "string",
  "title": "string",
  "description": "string",
  "preconditions": "string",
  "steps": ["string"],
  "expectedResult": "string",
  "testData": "string",
  "priority": "High | Medium | Low",
  "status": "Draft | Ready",
  "generatedCode": { "framework": "string", "content": "string" }
}
```

### CodeGenerationRequest

```json
{
  "testCase": { "TestCase" },
  "framework": "playwright-js | playwright-py | selenium-py",
  "browser": "chromium | firefox | webkit | chrome"
}
```

## Behavioral Rules

- Jira fetch uses REST v3; verify via `GET /rest/api/3/myself`.
- Test case generation prompts must incorporate `Test_Cases_Prompt.md` Template 2 (PRD-style) when building from a test plan.
- Rate limits: surface provider errors to the user without retry storms.

## Maintenance Log

- 2026-04-05: Initial constitution and schemas for v1 monorepo (`web` + `server`).
