# SOP: LLM Providers

## Goal

Unified chat completion for plan, test case, and code generation.

## Providers

| Provider | Default base URL | Notes |
|----------|------------------|-------|
| groq | `https://api.groq.com/openai/v1` | OpenAI-compatible |
| ollama | `http://127.0.0.1:11434/v1` | OpenAI-compatible |
| gemini | (SDK) | Uses `GOOGLE_API_KEY` or request `apiKey` |

## Test Connection

- Send minimal user message; expect non-empty assistant text or structured error.

## Output

- Prefer JSON in fenced blocks for structured endpoints; parse leniently.
