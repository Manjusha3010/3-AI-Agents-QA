import base64
import re
from typing import Any

import httpx

from app.schemas import JiraConnection, JiraStory


def _basic_header(conn: JiraConnection) -> str:
    raw = f"{conn.email}:{conn.api_token}".encode()
    return base64.b64encode(raw).decode()


def normalize_jira_url(url: str) -> str:
    u = url.strip().rstrip("/")
    if not u.startswith("http"):
        u = "https://" + u
    return u


def adf_to_text(node: Any) -> str:
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        if node.get("type") == "text" and "text" in node:
            return str(node["text"])
        parts: list[str] = []
        for c in node.get("content") or []:
            parts.append(adf_to_text(c))
        return "".join(parts)
    if isinstance(node, list):
        return "\n".join(adf_to_text(x) for x in node)
    return str(node)


def extract_acceptance(description: str) -> tuple[str, str]:
    if not description:
        return "", ""
    m = re.search(
        r"(?is)(acceptance\s*criteria|acceptance\s*conditions)\s*[:\n]+(.+)$",
        description,
    )
    if m:
        ac = m.group(2).strip()
        main = description[: m.start()].strip()
        return main, ac
    return description, ""


async def verify_jira(conn: JiraConnection) -> dict[str, Any]:
    base = normalize_jira_url(conn.jira_url)
    headers = {
        "Authorization": f"Basic {_basic_header(conn)}",
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(f"{base}/rest/api/3/myself", headers=headers)
        r.raise_for_status()
        return r.json()


async def search_issues(conn: JiraConnection, jql: str, max_results: int) -> list[JiraStory]:
    base = normalize_jira_url(conn.jira_url)
    headers = {
        "Authorization": f"Basic {_basic_header(conn)}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    body = {
        "jql": jql,
        "maxResults": max_results,
        "fields": [
            "summary",
            "description",
            "status",
            "issuetype",
        ],
    }
    # Jira Cloud removed POST /rest/api/3/search (HTTP 410). Use enhanced search:
    # https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/
    url = f"{base}/rest/api/3/search/jql"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=body)
        r.raise_for_status()
        data = r.json()

    out: list[JiraStory] = []
    for issue in data.get("issues") or []:
        fields = issue.get("fields") or {}
        desc_field = fields.get("description")
        if isinstance(desc_field, dict):
            desc_text = adf_to_text(desc_field).strip()
        else:
            desc_text = (desc_field or "") if isinstance(desc_field, str) else ""
        main, ac = extract_acceptance(desc_text)
        st = (fields.get("status") or {}).get("name") or ""
        out.append(
            JiraStory(
                key=issue.get("key") or "",
                summary=fields.get("summary") or "",
                description=main or desc_text,
                acceptance_criteria=ac,
                status=st,
                raw=issue,
            )
        )
    return out
