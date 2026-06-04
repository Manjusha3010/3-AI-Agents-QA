import type { JiraStory } from "../types";

export const SAMPLE_STORIES: JiraStory[] = [
  {
    key: "SCRUM-1",
    summary: "As a user, I want to reset my password, so that I can regain access to my account.",
    description:
      "User requests password reset from login screen. System sends email with secure link. User sets a new password meeting policy.",
    acceptanceCriteria:
      "- Valid email receives reset link within 5 minutes\n- Expired or invalid token shows clear error\n- Password must meet complexity rules",
    status: "IN PROGRESS",
  },
  {
    key: "SCRUM-2",
    summary: "As a customer, I want to view my order history, so I can track purchases.",
    description: "Authenticated users see a paginated list of past orders with status and totals.",
    acceptanceCriteria: "- Only own orders visible\n- Pagination works\n- Empty state when no orders",
    status: "TO DO",
  },
];
