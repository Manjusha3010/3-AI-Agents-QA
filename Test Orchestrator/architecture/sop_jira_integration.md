# SOP: Jira Integration

## Goal

Verify credentials and fetch user stories (issues) for test planning.

## Inputs

- `jiraUrl`: `https://{domain}.atlassian.net`
- `email`, `apiToken`

## Steps

1. Normalize URL: strip trailing slash; reject non-HTTPS in production UI.
2. `GET /rest/api/3/myself` with Basic auth → 200 means connection OK.
3. `POST /rest/api/3/search/jql` with JSON `{ jql, maxResults, fields }` — **not** legacy `/rest/api/3/search` (removed on Jira Cloud, HTTP 410). Default JQL: `type = Story ORDER BY updated DESC` (configurable in UI).

## Edge Cases

- 401: wrong email/token or token revoked.
- 404: wrong site URL.
- CAPTCHA / SSO-only accounts cannot use API token — document for user.
