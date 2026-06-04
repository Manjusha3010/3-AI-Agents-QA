import { useState } from "react";

import { TestCasesDataTable } from "../components/TestCasesDataTable";
import { useAppStore } from "../store/useAppStore";

export function TestCaseDashboardPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const testCases = useAppStore((s) => s.testCases);
  const removeTestCase = useAppStore((s) => s.removeTestCase);
  const upsertTestCase = useAppStore((s) => s.upsertTestCase);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test Case Dashboard</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Filterable table with quick view, sorting, and bulk selection.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50"
          disabled={selected.size === 0}
          onClick={() => {
            testCases.filter((t) => selected.has(t.id)).forEach((t) => upsertTestCase({ ...t, status: "Ready" }));
          }}
        >
          Mark Ready
        </button>
        <button
          type="button"
          className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-700 dark:border-red-900 dark:text-red-300 disabled:opacity-50"
          disabled={selected.size === 0}
          onClick={() => {
            selected.forEach((id) => removeTestCase(id));
            setSelected(new Set());
          }}
        >
          Delete selected
        </button>
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
