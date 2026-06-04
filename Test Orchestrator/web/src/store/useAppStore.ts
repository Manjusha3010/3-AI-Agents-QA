import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { JiraConnection, JiraStory, LLMSettings, StoryWorkSession, TestCase, TestPlan } from "../types";

const HISTORY_CAP = 10;
const RECENT_HIGHLIGHT = 3;

function newSessionId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AppState {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;

  llm: LLMSettings;
  setLlm: (p: Partial<LLMSettings>) => void;
  llmVerified: boolean;
  setLlmVerified: (v: boolean) => void;

  jira: JiraConnection;
  setJira: (p: Partial<JiraConnection>) => void;
  jiraConnected: boolean;
  setJiraConnected: (v: boolean) => void;

  stories: JiraStory[];
  setStories: (s: JiraStory[]) => void;

  currentPlan: TestPlan | null;
  /** Saves previous story to history when switching Jira keys; clears mismatched test cases. */
  setCurrentPlan: (p: TestPlan | null) => void;

  testCases: TestCase[];
  setTestCases: (t: TestCase[]) => void;
  upsertTestCase: (t: TestCase) => void;
  removeTestCase: (id: string) => void;

  selectedStoryKey: string | null;
  setSelectedStoryKey: (k: string | null) => void;

  codeTabCaseId: string | null;
  setCodeTabCaseId: (id: string | null) => void;

  /** Newest first; max HISTORY_CAP entries */
  storyHistory: StoryWorkSession[];
  restoreStorySession: (id: string) => void;
  removeStorySession: (id: string) => void;
}

const defaultLlm: LLMSettings = {
  provider: "groq",
  apiKey: "",
  baseUrl: "",
  model: "llama-3.1-8b-instant",
};

const defaultJira: JiraConnection = {
  jiraUrl: "https://your-domain.atlassian.net",
  email: "",
  apiToken: "",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      setDarkMode: (v) => set({ darkMode: v }),

      llm: defaultLlm,
      setLlm: (p) => set({ llm: { ...get().llm, ...p }, llmVerified: false }),
      llmVerified: false,
      setLlmVerified: (v) => set({ llmVerified: v }),

      jira: defaultJira,
      setJira: (p) => set({ jira: { ...get().jira, ...p }, jiraConnected: false }),
      jiraConnected: false,
      setJiraConnected: (v) => set({ jiraConnected: v }),

      stories: [],
      setStories: (stories) => set({ stories }),

      currentPlan: null,
      setCurrentPlan: (currentPlan) =>
        set((state) => {
          const oldKey = state.currentPlan?.jiraKey ?? state.testCases[0]?.jiraKey ?? null;
          const newKey = currentPlan?.jiraKey ?? null;
          let storyHistory = state.storyHistory;
          if (currentPlan && newKey && oldKey && oldKey !== newKey && (state.currentPlan || state.testCases.length > 0)) {
            const summary = state.currentPlan?.title ?? state.testCases[0]?.title ?? oldKey;
            const entry: StoryWorkSession = {
              id: newSessionId(),
              jiraKey: oldKey,
              storySummary: summary,
              plan: state.currentPlan,
              testCases: state.testCases.map((t) => ({ ...t, generatedCode: t.generatedCode ? { ...t.generatedCode } : undefined })),
              savedAt: new Date().toISOString(),
            };
            storyHistory = [entry, ...storyHistory.filter((h) => h.jiraKey !== oldKey)].slice(0, HISTORY_CAP);
          }
          let testCases = state.testCases;
          if (currentPlan && newKey && oldKey && oldKey !== newKey) {
            testCases = [];
          }
          return {
            currentPlan,
            testCases,
            storyHistory,
            selectedStoryKey: currentPlan ? currentPlan.jiraKey : state.selectedStoryKey,
            codeTabCaseId: currentPlan && newKey && oldKey && oldKey !== newKey ? null : state.codeTabCaseId,
          };
        }),

      testCases: [],
      setTestCases: (testCases) => set({ testCases }),
      upsertTestCase: (t) =>
        set({
          testCases: [...get().testCases.filter((x) => x.id !== t.id), t],
        }),
      removeTestCase: (id) =>
        set({ testCases: get().testCases.filter((x) => x.id !== id) }),

      selectedStoryKey: null,
      setSelectedStoryKey: (selectedStoryKey) => set({ selectedStoryKey }),

      codeTabCaseId: null,
      setCodeTabCaseId: (codeTabCaseId) => set({ codeTabCaseId }),

      storyHistory: [],
      restoreStorySession: (id) =>
        set((state) => {
          const target = state.storyHistory.find((h) => h.id === id);
          if (!target) return state;
          const curKey = state.currentPlan?.jiraKey ?? state.testCases[0]?.jiraKey ?? null;
          let storyHistory = state.storyHistory;
          if (curKey && (state.currentPlan || state.testCases.length > 0)) {
            const summary = state.currentPlan?.title ?? state.testCases[0]?.title ?? curKey;
            const entry: StoryWorkSession = {
              id: newSessionId(),
              jiraKey: curKey,
              storySummary: summary,
              plan: state.currentPlan,
              testCases: state.testCases.map((t) => ({ ...t, generatedCode: t.generatedCode ? { ...t.generatedCode } : undefined })),
              savedAt: new Date().toISOString(),
            };
            storyHistory = [entry, ...storyHistory.filter((h) => h.jiraKey !== curKey)].slice(0, HISTORY_CAP);
          }
          return {
            currentPlan: target.plan,
            testCases: target.testCases.map((t) => ({ ...t, generatedCode: t.generatedCode ? { ...t.generatedCode } : undefined })),
            selectedStoryKey: target.jiraKey,
            storyHistory,
            codeTabCaseId: target.testCases[0]?.id ?? null,
          };
        }),
      removeStorySession: (id) =>
        set((state) => ({
          storyHistory: state.storyHistory.filter((h) => h.id !== id),
        })),
    }),
    {
      name: "test-orchestrator",
      partialize: (s) => ({
        darkMode: s.darkMode,
        llm: { ...s.llm, apiKey: s.llm.apiKey },
        jira: { ...s.jira, apiToken: s.jira.apiToken },
        jiraConnected: s.jiraConnected,
        llmVerified: s.llmVerified,
        stories: s.stories,
        currentPlan: s.currentPlan,
        testCases: s.testCases,
        selectedStoryKey: s.selectedStoryKey,
        storyHistory: s.storyHistory,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState>;
        return {
          ...current,
          ...p,
          storyHistory: Array.isArray(p.storyHistory) ? p.storyHistory : current.storyHistory,
        };
      },
    },
  ),
);

export { HISTORY_CAP, RECENT_HIGHLIGHT };
