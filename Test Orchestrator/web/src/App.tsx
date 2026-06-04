import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./layout/AppLayout";
import { CodeGeneratorPage } from "./pages/CodeGeneratorPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JiraPage } from "./pages/JiraPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TestCaseDashboardPage } from "./pages/TestCaseDashboardPage";
import { TestCasesPage } from "./pages/TestCasesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { TestPlanPage } from "./pages/TestPlanPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jira" element={<JiraPage />} />
          <Route path="/test-plan" element={<TestPlanPage />} />
          <Route path="/test-cases" element={<TestCasesPage />} />
          <Route path="/test-case-dashboard" element={<TestCaseDashboardPage />} />
          <Route path="/code" element={<CodeGeneratorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
