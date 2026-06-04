import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.schemas import CodeGenPayload, TestCaseOut, TestCasesPayload, TestPlanPayload
from app.services.llm_service import chat_complete, chat_complete_json
from app.services.prompts import (
    CODE_SYSTEM,
    TEST_CASES_SYSTEM,
    TEST_PLAN_SYSTEM,
    code_user,
    test_cases_user,
    test_plan_user,
)

router = APIRouter(prefix="/api/generate", tags=["generate"])


@router.post("/test-plan")
async def generate_test_plan(body: TestPlanPayload):
    try:
        md = await chat_complete(
            body.llm,
            TEST_PLAN_SYSTEM,
            test_plan_user(body.story),
        )
        plan_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        return {
            "plan": {
                "id": plan_id,
                "jiraKey": body.story.key,
                "title": body.story.summary,
                "contentMarkdown": md,
                "createdAt": now,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


def _normalize_cases(raw: object, jira_key: str) -> list[TestCaseOut]:
    if not isinstance(raw, list):
        raise ValueError("Expected JSON array of test cases")
    out: list[TestCaseOut] = []
    for i, item in enumerate(raw, start=1):
        if not isinstance(item, dict):
            continue
        tid = f"TC-{jira_key}-{i}"
        pr = str(item.get("priority", "Medium"))
        if pr not in ("High", "Medium", "Low"):
            pr = "Medium"
        st = str(item.get("status", "Draft"))
        if st not in ("Draft", "Ready"):
            st = "Draft"
        steps = item.get("steps") or []
        if isinstance(steps, str):
            steps = [steps]
        elif not isinstance(steps, list):
            steps = []
        steps = [str(s) for s in steps]
        out.append(
            TestCaseOut.model_validate(
                {
                    "id": tid,
                    "jiraKey": jira_key,
                    "title": str(item.get("title", f"Test {i}")),
                    "description": str(item.get("description", "")),
                    "preconditions": str(item.get("preconditions", "")),
                    "steps": steps,
                    "expectedResult": str(item.get("expectedResult", "")),
                    "testData": str(item.get("testData", "")),
                    "priority": pr,
                    "status": st,
                }
            )
        )
    return out


@router.post("/test-cases")
async def generate_test_cases(body: TestCasesPayload):
    try:
        raw = await chat_complete_json(
            body.llm,
            TEST_CASES_SYSTEM,
            test_cases_user(body.jira_key, body.plan_markdown, body.count),
        )
        cases = _normalize_cases(raw, body.jira_key)
        if not cases:
            raise ValueError("No test cases parsed from model output")
        return {"testCases": [c.model_dump(by_alias=True) for c in cases]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/code")
async def generate_code(body: CodeGenPayload):
    try:
        user = code_user(body.test_case, body.framework, body.browser)
        code = await chat_complete(body.llm, CODE_SYSTEM, user)
        code = code.strip()
        if code.startswith("```"):
            code = code.split("\n", 1)[-1]
            code = code.rsplit("```", 1)[0].strip()
        return {
            "framework": body.framework,
            "browser": body.browser,
            "content": code,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
