#!/usr/bin/env python3
"""BLAST Link: smoke-test LLM. Set one of: GROQ_API_KEY, OPENAI_API_KEY (for Groq base), OLLAMA_BASE, GEMINI_API_KEY."""
import os
import sys


def try_openai_compatible() -> bool:
    base = os.environ.get("LLM_BASE_URL", "")
    key = os.environ.get("GROQ_API_KEY") or os.environ.get("OPENAI_API_KEY", "")
    model = os.environ.get("LLM_MODEL", "llama-3.1-8b-instant")
    if not base or not key:
        return False
    try:
        from openai import OpenAI

        client = OpenAI(base_url=base, api_key=key)
        r = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say OK in one word."}],
            max_tokens=8,
        )
        text = (r.choices[0].message.content or "").strip()
        print("openai_compatible OK:", text[:80])
        return True
    except Exception as e:
        print("openai_compatible FAIL:", e, file=sys.stderr)
        return False


def try_gemini() -> bool:
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        return False
    try:
        import google.generativeai as genai

        genai.configure(api_key=key)
        model = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        m = genai.GenerativeModel(model)
        r = m.generate_content("Say OK in one word.")
        print("gemini OK:", (r.text or "")[:80])
        return True
    except Exception as e:
        print("gemini FAIL:", e, file=sys.stderr)
        return False


def main() -> int:
    if try_openai_compatible():
        return 0
    if try_gemini():
        return 0
    print(
        "Set LLM_BASE_URL + GROQ_API_KEY (or OPENAI_API_KEY), or GEMINI_API_KEY",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
