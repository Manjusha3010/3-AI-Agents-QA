from fastapi import APIRouter, HTTPException

from app.schemas import LLMSettings
from app.services.llm_service import chat_complete

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.post("/verify")
async def llm_verify(llm: LLMSettings):
    try:
        text = await chat_complete(
            llm,
            "You are a connectivity check assistant.",
            "Reply with exactly: OK",
        )
        if not text:
            raise ValueError("Empty response")
        return {"ok": True, "sample": text[:200]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
