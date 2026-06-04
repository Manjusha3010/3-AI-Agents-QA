from app.schemas import JiraStory, TestCaseOut


TEST_PLAN_SYSTEM = """You are a principal QA architect. Produce a professional Software Test Plan in Markdown.
Sections: Test Plan ID (use Jira key), Test Plan Name, Objective, Scope (bullets), Test Scenarios (high level), Test Data, Test Environment, Test Schedule, Test Deliverables, Test Completion Criteria.
Be concise but complete. No filler."""


def test_plan_user(story: JiraStory) -> str:
    ac = story.acceptance_criteria or ""
    return f"""Jira Key: {story.key}
Summary: {story.summary}

User story / description:
{story.description}

Acceptance criteria:
{ac}
"""


TEST_CASES_SYSTEM = """You are a Senior QA Engineer with 10+ years of experience (Test_Cases_Prompt Template 2: PRD comprehensive).

TASK: Generate comprehensive test cases from the test plan below.

COVERAGE AREAS:
- Functional (happy path)
- Negative scenarios
- Boundary values
- Edge cases

CONSTRAINTS:
- Use ONLY the test plan content
- No assumptions about unmentioned features
- Mark unclear items as "Needs clarification" inside description if needed
- Do NOT invent exact error message strings unless they appear in the plan

OUTPUT: Return ONLY a JSON array (no markdown fence) of objects with keys:
id (string, temporary e.g. TC-1),
title (string),
description (string),
preconditions (string),
steps (array of strings),
expectedResult (string),
testData (string),
priority (one of: High, Medium, Low),
status (one of: Draft, Ready)

Use realistic numbering; the server will assign final IDs."""


def test_cases_user(jira_key: str, plan_markdown: str, count: int) -> str:
    return f"""Jira key for traceability: {jira_key}
Target approximate count: {count}

TEST PLAN:
---
{plan_markdown}
---
"""


CODE_SYSTEM = """You are a senior test automation engineer. Output ONLY the full source code for one automated test file, no markdown fences, no explanation.
Requirements:
- Production quality: imports, setup, teardown, logging, explicit assertions.
- Use robust selectors (data-testid preferred; comment if assumed).
- Include test data setup and cleanup where relevant."""


def code_user(tc: TestCaseOut, framework: str, browser: str) -> str:
    steps = "\n".join(f"{i+1}. {s}" for i, s in enumerate(tc.steps))
    return f"""Framework: {framework}
Browser/engine preference: {browser}

Test case ID: {tc.id}
Title: {tc.title}
Description: {tc.description}
Preconditions: {tc.preconditions}
Steps:
{steps}
Expected result: {tc.expected_result}
Test data notes: {tc.test_data}

Implement the full script for this single test case."""
