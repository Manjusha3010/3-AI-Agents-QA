import clsx from "clsx";
import { ClipboardCopy, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { generateCode } from "../api/client";
import { useAppStore } from "../store/useAppStore";
import type { CodeFramework, TestCase } from "../types";

const frameworks: { id: CodeFramework; label: string }[] = [
  { id: "playwright-js", label: "Playwright (JavaScript)" },
  { id: "playwright-py", label: "Playwright (Python)" },
  { id: "selenium-py", label: "Selenium (Python)" },
];

export function CodeGeneratorPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const testCases = useAppStore((s) => s.testCases);
  const llm = useAppStore((s) => s.llm);
  const codeTabCaseId = useAppStore((s) => s.codeTabCaseId);
  const setCodeTabCaseId = useAppStore((s) => s.setCodeTabCaseId);
  const upsertTestCase = useAppStore((s) => s.upsertTestCase);

  const [framework, setFramework] = useState<CodeFramework>("playwright-js");
  const [browser, setBrowser] = useState("chromium");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeId = codeTabCaseId || testCases[0]?.id || null;
  const activeCase = useMemo(() => testCases.find((t) => t.id === activeId) || null, [testCases, activeId]);

  useEffect(() => {
    if (!activeCase) {
      setCode("");
      return;
    }
    const cached = activeCase.generatedCode?.[`${framework}:${browser}`];
    setCode(cached || "");
  }, [activeCase, framework, browser]);

  const runGenerate = async (tc: TestCase) => {
    if (!llm.apiKey && llm.provider !== "ollama") {
      setError("Set LLM API key in Settings.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { content } = await generateCode(tc, framework, browser, llm);
      setCode(content);
      const generatedCode = { ...(tc.generatedCode || {}), [`${framework}:${browser}`]: content };
      upsertTestCase({ ...tc, generatedCode });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
  };

  const card = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  if (testCases.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Code Generator</h1>
        <p className="text-slate-600 dark:text-slate-300">Generate test cases first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Test Orchestrator</h1>
        <p className="text-brand-600 font-medium">AI-Powered Automation Engine</p>
        <hr className="mt-4 border-slate-200 dark:border-slate-700" />
      </div>

      <section className={clsx("rounded-xl border p-5 shadow-sm space-y-4", card)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-600">Automation Script</h2>
            {activeCase && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                For Test Case:{" "}
                <span className="font-mono text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-100 px-2 py-0.5 rounded-md">
                  {activeCase.id}
                </span>{" "}
                {activeCase.title}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className={clsx(
                "rounded-lg border px-2 py-2 text-sm",
                darkMode ? "bg-slate-950 border-slate-700" : "bg-white border-slate-200",
              )}
              value={framework}
              onChange={(e) => setFramework(e.target.value as CodeFramework)}
            >
              {frameworks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              className={clsx(
                "rounded-lg border px-2 py-2 text-sm",
                darkMode ? "bg-slate-950 border-slate-700" : "bg-white border-slate-200",
              )}
              value={browser}
              onChange={(e) => setBrowser(e.target.value)}
            >
              <option value="chromium">chromium</option>
              <option value="firefox">firefox</option>
              <option value="webkit">webkit</option>
              <option value="chrome">chrome</option>
            </select>
            <button
              type="button"
              disabled={!activeCase || busy}
              onClick={() => activeCase && runGenerate(activeCase)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-3 py-2 text-sm disabled:opacity-50"
            >
              <RefreshCw className={clsx("h-4 w-4", busy && "animate-spin")} />
              Regenerate
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700">
          {testCases.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCodeTabCaseId(t.id)}
              className={clsx(
                "px-3 py-2 text-sm border-b-2 -mb-px",
                t.id === activeId
                  ? "border-brand-600 text-brand-600 font-medium"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              {t.id}
            </button>
          ))}
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-xs font-bold text-brand-500 tracking-wide">{framework.replace("-", " ").toUpperCase()}</span>
            <button
              type="button"
              onClick={copyCode}
              className="text-xs inline-flex items-center gap-1 text-slate-200 hover:text-white"
            >
              <ClipboardCopy className="h-3.5 w-3.5" /> Copy Code
            </button>
          </div>
          <textarea
            className="w-full min-h-[420px] bg-slate-950 text-slate-100 text-sm font-mono p-4 outline-none resize-y"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={activeCase ? "Click Regenerate to generate code…" : ""}
            spellCheck={false}
          />
        </div>
      </section>
    </div>
  );
}
