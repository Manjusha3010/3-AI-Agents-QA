export type LLMProvider = "groq" | "gemini" | "ollama";

export interface LLMSettings {
  provider: LLMProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface JiraConnection {
  jiraUrl: string;
  email: string;
  apiToken: string;
}

export interface JiraStory {
  key: string;
  summary: string;
  description: string;
  acceptanceCriteria: string;
  status: string;
  raw?: unknown;
}

export interface TestPlan {
  id: string;
  jiraKey: string;
  title: string;
  contentMarkdown: string;
  createdAt: string;
}

export type Priority = "High" | "Medium" | "Low";
export type Status = "Draft" | "Ready";

export interface TestCase {
  id: string;
  jiraKey: string;
  title: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  testData: string;
  priority: Priority;
  status: Status;
  generatedCode?: Record<string, string>;
}

export type CodeFramework = "playwright-js" | "playwright-py" | "selenium-py";

/** Snapshot of plan + test cases for one Jira story (saved when switching to another story). */
export interface StoryWorkSession {
  id: string;
  jiraKey: string;
  storySummary: string;
  plan: TestPlan | null;
  testCases: TestCase[];
  savedAt: string;
}
