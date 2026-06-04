import clsx from "clsx";
import { useState } from "react";

import { verifyLlm } from "../api/client";
import { useAppStore } from "../store/useAppStore";
import type { LLMProvider } from "../types";

const providerDefaults: Record<LLMProvider, { baseUrl: string; model: string }> = {
  groq: { baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.1-8b-instant" },
  ollama: { baseUrl: "http://127.0.0.1:11434/v1", model: "llama3" },
  gemini: { baseUrl: "", model: "gemini-1.5-flash" },
};

export function SettingsPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const llm = useAppStore((s) => s.llm);
  const setLlm = useAppStore((s) => s.setLlm);
  const setLlmVerified = useAppStore((s) => s.setLlmVerified);
  const llmVerified = useAppStore((s) => s.llmVerified);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const card = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  const onProvider = (p: LLMProvider) => {
    const d = providerDefaults[p];
    setLlm({ provider: p, baseUrl: d.baseUrl, model: d.model });
    setMsg(null);
  };

  const test = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await verifyLlm(llm);
      setLlmVerified(true);
      setMsg("Connection OK. Settings saved for this browser.");
    } catch (e) {
      setLlmVerified(false);
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>

      <section className={clsx("rounded-xl border shadow-lg p-6 space-y-5", card)}>
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold">
            1
          </span>
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">LLM Connection</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-center text-slate-500 mb-1">Provider</label>
          <select
            className={clsx(
              "w-full rounded-lg border px-3 py-2 text-sm",
              darkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200",
            )}
            value={llm.provider}
            onChange={(e) => onProvider(e.target.value as LLMProvider)}
          >
            <option value="groq">Groq</option>
            <option value="gemini">Gemini</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-center text-slate-500 mb-1">Base URL / API Key</label>
            <input
              type="password"
              className={clsx(
                "w-full rounded-lg border px-3 py-2 text-sm",
                darkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200",
              )}
              placeholder={llm.provider === "gemini" ? "Gemini API key" : "API Key"}
              value={llm.apiKey}
              onChange={(e) => setLlm({ apiKey: e.target.value })}
            />
            {llm.provider === "ollama" && (
              <p className="text-[10px] text-slate-500 mt-1 text-center">API key optional for local Ollama</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-center text-slate-500 mb-1">Model Name</label>
            <input
              className={clsx(
                "w-full rounded-lg border px-3 py-2 text-sm",
                darkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200",
              )}
              value={llm.model}
              onChange={(e) => setLlm({ model: e.target.value })}
            />
          </div>
        </div>

        {(llm.provider === "groq" || llm.provider === "ollama") && (
          <div>
            <label className="block text-xs font-semibold text-center text-slate-500 mb-1">OpenAI-compatible Base URL</label>
            <input
              className={clsx(
                "w-full rounded-lg border px-3 py-2 text-sm",
                darkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200",
              )}
              value={llm.baseUrl || ""}
              onChange={(e) => setLlm({ baseUrl: e.target.value })}
            />
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={test}
          className="w-full rounded-lg bg-brand-600 text-white py-3 font-medium hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Testing…" : "Test Connection & Continue →"}
        </button>

        {llmVerified && <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">Verified</p>}
        {msg && <p className="text-center text-sm text-slate-600 dark:text-slate-300">{msg}</p>}
      </section>
    </div>
  );
}
