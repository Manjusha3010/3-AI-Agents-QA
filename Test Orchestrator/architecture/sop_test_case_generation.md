# SOP: Test Case Generation

## Goal

Produce structured test cases from an approved test plan text, using prompt discipline from `Test_Cases_Prompt.md` (Template 2: PRD comprehensive).

## Prompt Rules

- ROLE: Senior QA Engineer with 10+ years experience.
- COVERAGE: functional, negative, boundary, edge (where applicable).
- CONSTRAINTS: only plan content; mark gaps "Needs clarification".
- OUTPUT: JSON array of test case objects matching `TestCase` schema in `gemini.md`.

## Fields Per Case

- title, description, preconditions, steps[], expectedResult, testData, priority, status (default Draft).
