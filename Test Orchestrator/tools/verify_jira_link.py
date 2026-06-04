#!/usr/bin/env python3
"""BLAST Link: minimal Jira API handshake. Usage: set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN."""
import base64
import os
import sys
import urllib.request
import urllib.error


def main() -> int:
    url = os.environ.get("JIRA_URL", "").rstrip("/")
    email = os.environ.get("JIRA_EMAIL", "")
    token = os.environ.get("JIRA_API_TOKEN", "")
    if not all([url, email, token]):
        print("Set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN", file=sys.stderr)
        return 1
    raw = f"{email}:{token}".encode()
    auth = base64.b64encode(raw).decode()
    req = urllib.request.Request(
        f"{url}/rest/api/3/myself",
        headers={"Authorization": f"Basic {auth}", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode()
        print("OK", resp.status, body[:200])
        return 0
    except urllib.error.HTTPError as e:
        print("HTTPError", e.code, e.read().decode()[:500], file=sys.stderr)
        return 2
    except Exception as e:
        print(type(e).__name__, e, file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
