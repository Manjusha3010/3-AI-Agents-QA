import clsx from "clsx";
import { Clock, RotateCcw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { RECENT_HIGHLIGHT, useAppStore } from "../store/useAppStore";

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function HistoryPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const storyHistory = useAppStore((s) => s.storyHistory);
  const restoreStorySession = useAppStore((s) => s.restoreStorySession);
  const removeStorySession = useAppStore((s) => s.removeStorySession);
  const navigate = useNavigate();

  const card = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-7 w-7 text-brand-600" />
          Story history
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          When you generate a test plan for a <strong>different</strong> Jira story, your previous story’s plan and test
          cases are saved here automatically (up to 10 stories). Restore a session to keep working on it, or remove it
          from the list.
        </p>
      </div>

      {storyHistory.length === 0 ? (
        <p className={clsx("rounded-xl border p-8 text-center text-slate-500", card)}>
          No saved sessions yet. Generate a plan for one story, then generate a plan for another — the first story’s work
          will appear here.
        </p>
      ) : (
        <ul className="space-y-4">
          {storyHistory.map((h, idx) => (
            <li
              key={h.id}
              className={clsx(
                "rounded-xl border p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
                card,
                idx < RECENT_HIGHLIGHT && "ring-1 ring-brand-200 dark:ring-brand-900",
              )}
            >
              <div className="space-y-1 min-w-0">
                {idx < RECENT_HIGHLIGHT && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                    Recent
                  </span>
                )}
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{h.jiraKey}</div>
                <div className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{h.storySummary}</div>
                <div className="text-xs text-slate-500">
                  Saved {formatWhen(h.savedAt)} · {h.testCases.length} test case{h.testCases.length === 1 ? "" : "s"} ·{" "}
                  {h.plan ? "Has test plan" : "No plan snapshot"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    restoreStorySession(h.id);
                    navigate(h.plan ? "/test-plan" : "/test-cases");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-3 py-2 text-sm font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => removeStorySession(h.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
