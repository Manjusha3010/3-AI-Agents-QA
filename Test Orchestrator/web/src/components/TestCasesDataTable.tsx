import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Priority, Status, TestCase } from "../types";

import { Modal } from "./Modal";
import { PriorityBadge, StatusBadge } from "./Badge";

export function TestCasesDataTable({
  cases,
  selectedIds,
  onToggleRow,
  onToggleAll,
  darkMode,
}: {
  cases: TestCase[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  darkMode: boolean;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"" | Priority>("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [quick, setQuick] = useState<TestCase | null>(null);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (priorityFilter && c.priority !== priorityFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [cases, globalFilter, priorityFilter, statusFilter]);

  const columns = useMemo<ColumnDef<TestCase>[]>(
    () => [
      {
        id: "select",
        header: () => {
          const all = filtered.map((c) => c.id);
          const allSelected = all.length > 0 && all.every((id) => selectedIds.has(id));
          return (
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={allSelected}
              onChange={() => onToggleAll(all)}
              aria-label="Select all visible"
            />
          );
        },
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-slate-300"
            checked={selectedIds.has(row.original.id)}
            onChange={() => onToggleRow(row.original.id)}
            aria-label={`Select ${row.original.id}`}
          />
        ),
        size: 36,
      },
      { accessorKey: "id", header: "ID", cell: (i) => <span className="font-mono text-xs">{i.getValue() as string}</span> },
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: (i) => <PriorityBadge p={i.getValue() as Priority} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (i) => <StatusBadge s={i.getValue() as Status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            className="text-brand-600 text-sm inline-flex items-center gap-1"
            onClick={() => setQuick(row.original)}
          >
            <Eye className="h-4 w-4" /> Quick view
          </button>
        ),
      },
    ],
    [filtered, onToggleAll, onToggleRow, selectedIds],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const card = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  return (
    <div className={clsx("rounded-xl border shadow-sm", card)}>
      <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className={clsx(
              "w-full rounded-lg border pl-9 pr-3 py-2 text-sm",
              darkMode ? "bg-slate-950 border-slate-700" : "bg-white border-slate-200",
            )}
            placeholder="Search ID, title, description..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className={clsx(
              "rounded-lg border px-2 py-2 text-sm",
              darkMode ? "bg-slate-950 border-slate-700" : "bg-white border-slate-200",
            )}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "" | Priority)}
          >
            <option value="">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            className={clsx(
              "rounded-lg border px-2 py-2 text-sm",
              darkMode ? "bg-slate-950 border-slate-700" : "bg-white border-slate-200",
            )}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | Status)}
          >
            <option value="">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={darkMode ? "bg-slate-800/80" : "bg-slate-50"}>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={clsx(
                  "border-t border-slate-100 dark:border-slate-800",
                  darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No test cases match filters.</div>
        )}
      </div>

      <Modal open={!!quick} title={quick?.title || "Test case"} onClose={() => setQuick(null)} wide>
        {quick && (
          <div className="space-y-3 text-sm">
            <div className="flex gap-2 items-center">
              <span className="font-mono text-xs">{quick.id}</span>
              <PriorityBadge p={quick.priority} />
              <StatusBadge s={quick.status} />
            </div>
            <p className="text-slate-600 dark:text-slate-300">{quick.description}</p>
            <div>
              <div className="font-semibold mb-1">Preconditions</div>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{quick.preconditions || "—"}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold mb-1">Steps</div>
                <ol className="list-decimal pl-5 space-y-1 text-slate-700 dark:text-slate-200">
                  {quick.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-100 dark:border-emerald-900">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Expected result</div>
                <p className="text-emerald-900/90 dark:text-emerald-100/90 whitespace-pre-wrap">{quick.expectedResult}</p>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Test data</div>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{quick.testData || "—"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
