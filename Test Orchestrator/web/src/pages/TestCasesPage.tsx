import clsx from "clsx";
import { Copy, Download, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PriorityBadge } from "../components/Badge";
import { useAppStore } from "../store/useAppStore";
import type { TestCase } from "../types";

function toCsv(cases: TestCase[]) {
  const headers = ["id", "title", "priority", "status", "description", "preconditions", "steps", "expectedResult", "testData"];
  const rows = cases.map((c) =>
    [
      c.id,
      c.title,
      c.priority,
      c.status,
      c.description,
      c.preconditions,
      c.steps.join(" | "),
      c.expectedResult,
      c.testData,
    ].map((x) => `"${String(x).replace(/"/g, '""')}"`),
  );
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function TestCasesPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const testCases = useAppStore((s) => s.testCases);
  const currentPlan = useAppStore((s) => s.currentPlan);
  const removeTestCase = useAppStore((s) => s.removeTestCase);
  const setCodeTabCaseId = useAppStore((s) => s.setCodeTabCaseId);
  const navigate = useNavigate();

  const jiraKey = currentPlan?.jiraKey || testCases[0]?.jiraKey || "—";

  const copyAll = async () => {
    const text = testCases.map((c) => `# ${c.id} ${c.title}\n${c.description}\n`).join("\n");
    await navigator.clipboard.writeText(text);
  };

  const downloadCsv = () => {
    const blob = new Blob([toCsv(testCases)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-cases-${jiraKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const card = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Generated Test Cases</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mapped to: <span className="font-mono">{jiraKey}</span>
            <span
              className={clsx(
                "ml-3 text-xs font-semibold px-2 py-0.5 rounded-full",
                darkMode ? "bg-slate-800" : "bg-slate-200",
              )}
            >
              {testCases.length} Cases
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyAll}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
          >
            <Copy className="h-4 w-4" /> Copy All
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-3 py-2 text-sm"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {testCases.map((c) => (
          <article key={c.id} className={clsx("rounded-xl border p-4 shadow-sm", card)}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{c.id}</span>
                  <PriorityBadge p={c.priority} />
                  <span className="font-medium text-slate-900 dark:text-slate-50">{c.title}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => removeTestCase(c.id)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeTabCaseId(c.id);
                    navigate("/code");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-3 py-2 text-sm font-medium"
                >
                  Generate Code <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Steps to Reproduce</div>
                <ol className="list-decimal pl-5 space-y-1 text-slate-700 dark:text-slate-200">
                  {c.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 p-3">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Expected Result</div>
                <p className="text-emerald-900/90 dark:text-emerald-100/90 whitespace-pre-wrap">{c.expectedResult}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {testCases.length === 0 && (
        <p className="text-center text-slate-500 py-10">No test cases yet. Create them from the Test Plan Generator.</p>
      )}
    </div>
  );
}
