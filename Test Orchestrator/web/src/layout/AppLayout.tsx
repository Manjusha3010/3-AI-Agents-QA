import clsx from "clsx";
import {
  LayoutDashboard,
  Link2,
  ListChecks,
  FileCode2,
  Settings,
  Sparkles,
  Table2,
  Moon,
  Sun,
  History,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { checkApiHealth } from "../api/client";
import { useAppStore } from "../store/useAppStore";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jira", label: "Jira Integration Module", icon: Link2 },
  { to: "/test-plan", label: "Test Plan Generator", icon: ListChecks },
  { to: "/test-cases", label: "Test Case Creator", icon: Sparkles },
  { to: "/test-case-dashboard", label: "Test Case Dashboard", icon: Table2 },
  { to: "/history", label: "Story history", icon: History },
  { to: "/code", label: "Code Generator", icon: FileCode2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const darkMode = useAppStore((s) => s.darkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      checkApiHealth().then((r) => {
        if (!cancelled) setApiOk(r.ok);
      });
    };
    run();
    const t = setInterval(run, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className={clsx("min-h-screen flex", darkMode && "dark")}>
      <aside
        className={clsx(
          "w-64 shrink-0 border-r flex flex-col",
          darkMode ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200",
        )}
      >
        <div
          className={clsx(
            "p-4 font-semibold text-sm border-b",
            darkMode ? "border-slate-700" : "border-slate-200",
          )}
        >
          Test Orchestrator
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? darkMode
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-brand-700 font-medium"
                    : darkMode
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-50",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div
          className={clsx(
            "p-3 border-t flex items-center justify-between text-xs",
            darkMode ? "border-slate-700" : "border-slate-200",
          )}
        >
          <span>{darkMode ? "Dark mode" : "Light mode"}</span>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2 py-1",
              darkMode ? "bg-slate-800" : "bg-slate-100",
            )}
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </aside>
      <main
        className={clsx(
          "flex-1 overflow-auto",
          darkMode ? "bg-slate-950 text-slate-50" : "bg-slate-100",
        )}
      >
        {apiOk === false && (
          <div
            className="bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-50 px-4 py-2 text-sm border-b border-amber-200 dark:border-amber-800"
            role="status"
          >
            <strong className="font-semibold">Cannot reach the API.</strong> Use one URL for everything: run{" "}
            <code className="rounded bg-amber-200/80 dark:bg-amber-900 px-1">.\scripts\start.ps1</code> from the
            project folder, then open{" "}
            <a href="http://127.0.0.1:8000" className="underline font-medium">
              http://127.0.0.1:8000
            </a>
            . (Vite-only dev on :5180 needs the API on :8000.)
          </div>
        )}
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
