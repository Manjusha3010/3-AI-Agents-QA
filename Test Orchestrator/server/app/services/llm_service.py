import asyncio
import json
import re
from typing import Any

from openai import OpenAI

from app.schemas import LLMSettings


def default_base_url(provider: str) -> str | None:
    if provider == "groq":
        return "https://api.groq.com/openai/v1"
    if provider == "ollama":
        return "http://127.0.0.1:11434/v1"
    return None


def _extract_json_blob(text: str) -> Any | None:
    t = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", t, re.I)
    if fence:
        t = fence.group(1).strip()
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        pass
    start = t.find("[")
    end = t.rfind("]")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(t[start : end + 1])
        except json.JSONDecodeError:
            return None
    start = t.find("{")
    end = t.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(t[start : end + 1])
        except json.JSONDecodeError:
            return None
    return None


async def chat_complete(llm: LLMSettings, system: str, user: str) -> str:
    if llm.provider == "gemini":
        return await asyncio.to_thread(_gemini_complete, llm, system, user)
    base = llm.base_url or default_base_url(llm.provider)
    if not base:
        raise ValueError("baseUrl required for this provider")
    key = llm.api_key or "ollama"
    client = OpenAI(base_url=base, api_key=key)

    def _run() -> str:
        resp = client.chat.completions.create(
            model=llm.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.2,
        )
        return (resp.choices[0].message.content or "").strip()

    return await asyncio.to_thread(_run)


def _gemini_complete(llm: LLMSettings, system: str, user: str) -> str:
    import google.generativeai as genai

    if not llm.api_key:
        raise ValueError("Gemini requires apiKey")
    genai.configure(api_key=llm.api_key)
    model = genai.GenerativeModel(llm.model)
    prompt = f"{system}\n\n{user}"
    r = model.generate_content(prompt)
    return (getattr(r, "text", None) or "").strip()


async def chat_complete_json(llm: LLMSettings, system: str, user: str) -> Any:
    text = await chat_complete(llm, system, user)
    parsed = _extract_json_blob(text)
    if parsed is None:
        raise ValueError("Model did not return valid JSON")
    return parsed
