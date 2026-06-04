import clsx from "clsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchJiraStories, generateTestPlan, verifyJira } from "../api/client";
import { SAMPLE_STORIES } from "../data/sampleStories";
import { useAppStore } from "../store/useAppStore";

export function JiraPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const jira = useAppStore((s) => s.jira);
  const setJira = useAppStore((s) => s.setJira);
  const jiraConnected = useAppStore((s) => s.jiraConnected);
  const setJiraConnected = useAppStore((s) => s.setJiraConnected);
  const stories = useAppStore((s) => s.stories);
  const setStories = useAppStore((s) => s.setStories);
  const llm = useAppStore((s) => s.llm);
  const setCurrentPlan = useAppStore((s) => s.setCurrentPlan);
  const setSelectedStoryKey = useAppStore((s) => s.setSelectedStoryKey);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const card = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  const onTestConnection = async () => {
    setError(null);
    setBusy("conn");
    try {
      await verifyJira(jira);
      setJiraConnected(true);
    } catch (e) {
      setJiraConnected(false);
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setBusy(null);
    }
  };

  const onFetchStories = async () => {
    setError(null);
    setBusy("fetch");
    try {
      if (!jiraConnected) {
        setError("Test Jira connection first.");
        return;
      }
      const { stories: s } = await fetchJiraStories(jira);
      setStories(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setBusy(null);
    }
  };

  const onSimulated = () => {
    setStories(SAMPLE_STORIES);
    setJiraConnected(true);
    setError(null);
  };

  const onGeneratePlan = async (key: string) => {
    const story = stories.find((x) => x.key === key);
    if (!story) return;
    if (!llm.apiKey && llm.provider !== "ollama") {
      setError("Configure LLM API key in Settings.");
      navigate("/settings");
      return;
    }
    setError(null);
    setBusy(`plan-${key}`);
    try {
      const { plan } = await generateTestPlan(story, llm);
      setCurrentPlan(plan);
      setSelectedStoryKey(key);
      navigate("/test-plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plan generation failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-wide text-slate-900 dark:text-white">JIRA INTEGRATION MODULE</h1>

      <section className={clsx("rounded-xl border p-5 shadow-sm space-y-4", card)}>
        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-semibold text-center text-slate-500 mb-1">Jira URL</label>
            <input
              className={clsx(
                "w-full rounded-lg border px-3 py-2 text-sm",
                darkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200",
              )}
              value={jira.jiraUrl}
              onChange={(e) => setJira({ jiraUrl: e.target.value })}
              placeholder="https://your-domain.atlassian.net"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-center text-slate-500 mb-1">Email</label>
              <input
                className={clsx(
                  "w-full rounded-lg border px-3 py-2 text-sm",
                  darkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200",
                )}
                value={jira.email}
                onChange={(e) => setJira({ email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-center text-slate-500 mb-1">API Token</label>
              <input
                type="password"
                className={clsx(
                  "w-full rounded-lg border px-3 py-2 text-sm",
                  darkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200",
                )}
                value={jira.apiToken}
                onChange={(e) => setJira({ apiToken: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onTestConnection}
              disabled={busy === "conn"}
              className="w-full max-w-md rounded-lg bg-brand-600 text-white py-2.5 font-medium hover:bg-brand-700 disabled:opacity-60"
            >
              {busy === "conn" ? "Testing…" : "Test Connection"}
            </button>
          </div>
          {jiraConnected && (
            <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">Jira connection verified.</p>
          )}
        </div>
      </section>

      <section className={clsx("rounded-xl border p-5 shadow-sm space-y-4", card)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Jira User Stories</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Fetch requirements from your Jira board or use simulated data.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSimulated}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
            >
              Load sample stories
            </button>
            <button
              type="button"
              onClick={onFetchStories}
              disabled={busy === "fetch"}
              className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:opacity-95 disabled:opacity-60"
            >
              {busy === "fetch" ? "Fetching…" : "Fetch Stories"}
            </button>
          </div>
        </div>

        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          {stories.map((s) => (
            <article
              key={s.key}
              className={clsx(
                "rounded-xl border p-4 flex flex-col gap-2",
                darkMode ? "border-slate-700 bg-slate-950/50" : "border-slate-200 bg-slate-50/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold">{s.key}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">{s.status}</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100">{s.summary}</h3>
              <div className="text-xs text-slate-500 space-y-1">
                <div>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">User Story</span>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-200">{s.description || "—"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Acceptance Criteria</span>
                  <p className="mt-0.5 whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                    {s.acceptanceCriteria || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-2">
                <button
                  type="button"
                  disabled={busy === `plan-${s.key}`}
                  onClick={() => onGeneratePlan(s.key)}
                  className="w-full rounded-lg bg-brand-600 text-white py-2 text-sm font-medium"
                >
                  {busy === `plan-${s.key}` ? "Generating…" : "Generate Test Plan →"}
                </button>
              </div>
            </article>
          ))}
        </div>
        {stories.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-6">No stories loaded yet.</p>
        )}
      </section>
    </div>
  );
}
