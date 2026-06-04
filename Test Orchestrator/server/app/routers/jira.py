from fastapi import APIRouter, HTTPException

from app.schemas import JiraConnection, JiraSearchBody
from app.services.jira_service import search_issues, verify_jira

router = APIRouter(prefix="/api/jira", tags=["jira"])


@router.post("/verify")
async def jira_verify(conn: JiraConnection):
    try:
        me = await verify_jira(conn)
        return {"ok": True, "displayName": me.get("displayName"), "email": me.get("emailAddress")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/stories")
async def jira_stories(body: JiraSearchBody):
    try:
        stories = await search_issues(body.connection, body.jql, body.max_results)
        return {"stories": [s.model_dump(by_alias=True) for s in stories]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
