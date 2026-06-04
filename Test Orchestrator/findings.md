# Findings

- Jira Cloud uses Basic auth: `email:api_token` Base64; site URL must be origin only (no trailing path).
- Groq and Ollama expose OpenAI-compatible chat completions; Gemini uses `google-generativeai` or Generative Language API.
- Wireframes show two test-case views: card-based creator and dashboard KPIs; spec also requires a filterable table — implemented as Dashboard table + Creator cards sharing the same store.
