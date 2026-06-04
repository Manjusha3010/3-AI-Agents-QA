import type { CodeFramework, JiraConnection, JiraStory, LLMSettings, TestCase, TestPlan } from "../types";

/**
 * - If VITE_API_URL is set → use it.
 * - If UI is served from FastAPI (production build, same origin) → "" (relative /api/...).
 * - Vite dev server → call API directly on 8000 (CORS allowed).
 */
function apiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.PROD) {
    return "";
  }
  return "http://127.0.0.1:8000";
}

const base = () => apiBaseUrl();

const BACKEND_HINT =
  "Open ONE URL: http://127.0.0.1:8000 — from the project folder run: .\\scripts\\start.ps1 (builds UI + starts server). Or: cd web && npm run build, then cd ..\\server && .\\.venv\\Scripts\\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000";

function mapNetworkError(e: unknown): Error {
  const name = e instanceof Error ? e.name : "";
  const message = e instanceof Error ? e.message : String(e);
  if (
    name === "TypeError" ||
    /failed to fetch|networkerror|load failed|connection refused|network request failed|cors|blocked by/i.test(
      message,
    )
  ) {
    return new Error(`Cannot reach the backend at ${base() || "same page (port 8000)"}. ${BACKEND_HINT}`);
  }
  return e instanceof Error ? e : new Error(message);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${base()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw mapNetworkError(e);
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const d = (data as { detail?: string | { msg: string }[] }).detail;
    const msg = Array.isArray(d) ? d.map((x) => x.msg).join("; ") : d;
    if (r.status === 502 || r.status === 504) {
      throw new Error(`API proxy error (${r.status}). ${BACKEND_HINT}`);
    }
    throw new Error(msg || r.statusText || "Request failed");
  }
  return data as T;
}

export async function checkApiHealth(): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(`${base()}/api/health`);
    if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapNetworkError(e).message };
  }
}

export async function verifyJira(connection: JiraConnection) {
  return post<{ ok: boolean; displayName?: string }>("/api/jira/verify", {
    jiraUrl: connection.jiraUrl,
    email: connection.email,
    apiToken: connection.apiToken,
  });
}

export async function fetchJiraStories(
  connection: JiraConnection,
  jql = 'type = Story ORDER BY updated DESC',
  maxResults = 20,
) {
  return post<{ stories: JiraStory[] }>("/api/jira/stories", {
    connection: {
      jiraUrl: connection.jiraUrl,
      email: connection.email,
      apiToken: connection.apiToken,
    },
    jql,
    maxResults,
  });
}

export async function verifyLlm(llm: LLMSettings) {
  return post<{ ok: boolean; sample?: string }>("/api/llm/verify", {
    provider: llm.provider,
    apiKey: llm.apiKey,
    baseUrl: llm.baseUrl || null,
    model: llm.model,
  });
}

export async function generateTestPlan(story: JiraStory, llm: LLMSettings) {
  return post<{ plan: TestPlan }>("/api/generate/test-plan", {
    story,
    llm: {
      provider: llm.provider,
      apiKey: llm.apiKey,
      baseUrl: llm.baseUrl || null,
      model: llm.model,
    },
  });
}

export async function generateTestCases(planMarkdown: string, jiraKey: string, llm: LLMSettings, count = 8) {
  return post<{ testCases: TestCase[] }>("/api/generate/test-cases", {
    jiraKey,
    planMarkdown,
    llm: {
      provider: llm.provider,
      apiKey: llm.apiKey,
      baseUrl: llm.baseUrl || null,
      model: llm.model,
    },
    count,
  });
}

export async function generateCode(testCase: TestCase, framework: CodeFramework, browser: string, llm: LLMSettings) {
  return post<{ content: string; framework: string; browser: string }>("/api/generate/code", {
    testCase,
    framework,
    browser,
    llm: {
      provider: llm.provider,
      apiKey: llm.apiKey,
      baseUrl: llm.baseUrl || null,
      model: llm.model,
    },
  });
}
