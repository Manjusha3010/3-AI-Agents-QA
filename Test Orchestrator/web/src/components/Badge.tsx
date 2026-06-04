import clsx from "clsx";

import type { Priority, Status } from "../types";

export function PriorityBadge({ p }: { p: Priority }) {
  const cls =
    p === "High"
      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
      : p === "Medium"
        ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
        : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100";
  return (
    <span className={clsx("text-[10px] font-bold uppercase px-2 py-0.5 rounded", cls)}>
      {p}
    </span>
  );
}

export function StatusBadge({ s }: { s: Status }) {
  const cls =
    s === "Ready"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  return (
    <span className={clsx("text-[10px] font-semibold px-2 py-0.5 rounded", cls)}>{s}</span>
  );
}
