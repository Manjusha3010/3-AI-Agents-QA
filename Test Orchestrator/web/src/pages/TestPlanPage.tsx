import clsx from "clsx";
import { Copy, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { generateTestCases } from "../api/client";
import { useAppStore } from "../store/useAppStore";

export function TestPlanPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const currentPlan = useAppStore((s) => s.currentPlan);
  const llm = useAppStore((s) => s.llm);
  const setTestCases = useAppStore((s) => s.setTestCases);
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const card = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  const copyPlan = async () => {
    if (!currentPlan) return;
    await navigator.clipboard.writeText(currentPlan.contentMarkdown);
  };

  const createCases = async () => {
    if (!currentPlan) {
      setError("No test plan loaded. Generate one from Jira.");
      return;
    }
    if (!llm.apiKey && llm.provider !== "ollama") {
      navigate("/settings");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { testCases } = await generateTestCases(
        currentPlan.contentMarkdown,
        currentPlan.jiraKey,
        llm,
        8,
      );
      setTestCases(testCases);
      navigate("/test-cases");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate test cases");
    } finally {
      setBusy(false);
    }
  };

  if (!currentPlan) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test Plan Generator</h1>
        <p className="text-slate-600 dark:text-slate-300">
          No plan yet. Use <strong>Jira Integration</strong> and click <strong>Generate Test Plan</strong> on a story.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test Plan Generator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            For: <span className="font-mono">{currentPlan.jiraKey}</span> {currentPlan.title}
          </p>
        </div>
        <button
          type="button"
          onClick={copyPlan}
          className={clsx(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
            darkMode ? "border-slate-600" : "border-slate-300",
          )}
        >
          <Copy className="h-4 w-4" /> Copy Plan
        </button>
      </div>

      <section className={clsx("rounded-xl border p-5 shadow-sm", card)}>
        <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-slate-800 dark:text-slate-100">
          {currentPlan.contentMarkdown}
        </article>
      </section>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={createCases}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-3 font-medium shadow-sm disabled:opacity-60"
        >
          <Zap className="h-4 w-4" />
          {busy ? "Creating…" : "Create Test Cases from Plan"}
        </button>
      </div>
    </div>
  );
}
