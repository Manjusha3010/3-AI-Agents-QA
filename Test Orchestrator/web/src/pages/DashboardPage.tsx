import clsx from "clsx";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TestCasesDataTable } from "../components/TestCasesDataTable";
import { useAppStore } from "../store/useAppStore";

export function DashboardPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const jiraConnected = useAppStore((s) => s.jiraConnected);
  const currentPlan = useAppStore((s) => s.currentPlan);
  const testCases = useAppStore((s) => s.testCases);
  const storyHistory = useAppStore((s) => s.storyHistory);
  const removeTestCase = useAppStore((s) => s.removeTestCase);
  const upsertTestCase = useAppStore((s) => s.upsertTestCase);
  const navigate = useNavigate();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const codeGeneratedCount = useMemo(
    () => testCases.filter((t) => t.generatedCode && Object.keys(t.generatedCode).length > 0).length,
    [testCases],
  );

  const cards: { label: string; value: string; hint?: string }[] = [
    { label: "Active JIRA Connection", value: jiraConnected ? "Connected" : "Not connected" },
    { label: "Test plans generated", value: currentPlan ? "1" : "0" },
    { label: "Test cases (active story)", value: String(testCases.length) },
    { label: "Code generated (cases)", value: String(codeGeneratedCount) },
    {
      label: "Saved in story history",
      value: String(storyHistory.length),
      hint: "Previous Jira stories (auto-saved when you switch)",
    },
  ];

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelected((prev) => {
      const allIn = ids.length > 0 && ids.every((id) => prev.has(id));
      const n = new Set(prev);
      if (allIn) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  };

  const bulkDelete = () => {
    selected.forEach((id) => removeTestCase(id));
    setSelected(new Set());
  };

  const bulkMarkReady = () => {
    testCases
      .filter((t) => selected.has(t.id))
      .forEach((t) => upsertTestCase({ ...t, status: "Ready" }));
  };

  const cardStyle = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-wide text-slate-900 dark:text-white">DASHBOARD</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className={clsx("rounded-xl border p-4 shadow-sm", cardStyle)}>
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">{c.label}</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">{c.value}</div>
            {"hint" in c && c.hint ? (
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{c.hint}</div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">All test cases</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600"
            disabled={selected.size === 0}
            onClick={bulkMarkReady}
          >
            Mark Ready
          </button>
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-700 dark:border-red-900 dark:text-red-300"
            disabled={selected.size === 0}
            onClick={bulkDelete}
          >
            Delete selected
          </button>
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600"
            onClick={() => navigate("/history")}
          >
            Story history
          </button>
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-lg bg-brand-600 text-white"
            onClick={() => navigate("/code")}
          >
            Open Code Generator
          </button>
        </div>
      </div>

      <TestCasesDataTable
        cases={testCases}
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        darkMode={darkMode}
      />
    </div>
  );
}
