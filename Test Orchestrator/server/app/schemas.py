from typing import Any, Literal

from pydantic import BaseModel, Field


Provider = Literal["groq", "gemini", "ollama"]
Priority = Literal["High", "Medium", "Low"]
Status = Literal["Draft", "Ready"]
Framework = Literal["playwright-js", "playwright-py", "selenium-py"]


class LLMSettings(BaseModel):
    provider: Provider
    api_key: str = Field(default="", alias="apiKey")
    base_url: str | None = Field(default=None, alias="baseUrl")
    model: str = "llama-3.1-8b-instant"

    model_config = {"populate_by_name": True}


class JiraConnection(BaseModel):
    jira_url: str = Field(alias="jiraUrl")
    email: str
    api_token: str = Field(alias="apiToken")

    model_config = {"populate_by_name": True}


class JiraStory(BaseModel):
    key: str
    summary: str
    description: str = ""
    acceptance_criteria: str = Field(default="", alias="acceptanceCriteria")
    status: str = ""
    raw: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class TestPlanPayload(BaseModel):
    story: JiraStory
    llm: LLMSettings


class TestCasesPayload(BaseModel):
    jira_key: str = Field(alias="jiraKey")
    plan_markdown: str = Field(alias="planMarkdown")
    llm: LLMSettings
    count: int = Field(default=8, ge=1, le=30)

    model_config = {"populate_by_name": True}


class TestCaseOut(BaseModel):
    id: str
    jira_key: str = Field(alias="jiraKey")
    title: str
    description: str = ""
    preconditions: str = ""
    steps: list[str] = Field(default_factory=list)
    expected_result: str = Field(default="", alias="expectedResult")
    test_data: str = Field(default="", alias="testData")
    priority: Priority = "Medium"
    status: Status = "Draft"

    model_config = {"populate_by_name": True}


class CodeGenPayload(BaseModel):
    test_case: TestCaseOut = Field(alias="testCase")
    framework: Framework = "playwright-js"
    browser: str = "chromium"
    llm: LLMSettings

    model_config = {"populate_by_name": True}


class JiraSearchBody(BaseModel):
    connection: JiraConnection
    jql: str = 'type = Story ORDER BY updated DESC'
    max_results: int = Field(default=20, alias="maxResults", ge=1, le=50)

    model_config = {"populate_by_name": True}
