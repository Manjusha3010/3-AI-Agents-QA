# N8N Advanced RAG

Chat with your **own documents** using an [n8n](https://n8n.io/) workflow. Upload files into a vector database, then ask questions and get answers based on that content.

---

## What is this?

One file: **`AdvanceRAG.json`** — an n8n workflow named **`AdvanceRAG_2`**.

It has two parts:

| Part | What it does |
|------|----------------|
| **Ingestion** | Upload a file → split into chunks → store in **Qdrant** (`Advance_RAG` collection) |
| **Chat** | You ask a question → **AI Agent** searches Qdrant → **Cohere** re-ranks results → **Groq** writes the answer |

“Advanced RAG” here means: vector search **plus** re-ranking so the best chunks are used before the LLM replies.

---

## What you need

- **n8n** (self-hosted or cloud) with LangChain nodes
- API keys / accounts:
  - **Qdrant** — vector database
  - **Mistral** — embeddings (turn text into vectors)
  - **Cohere** — reranker
  - **Groq** — chat model (`openai/gpt-oss-120b` in the workflow)

Create a Qdrant collection named **`Advance_RAG`** (or change it in the workflow after import).

---

## Quick start

1. In n8n: **Import** → select `AdvanceRAG.json`.
2. Open workflow **AdvanceRAG_2** and set **credentials** on each node (Qdrant, Mistral, Cohere, Groq). Do not commit real keys to git.
3. **Ingest documents** (top section — *Ingestion*):
   - Enable **On form submission** and linked nodes if they are disabled.
   - Activate the workflow and open the form URL → upload a PDF/DOC, etc.
4. **Ask questions** (bottom section — chat):
   - Use **When chat message received** → open the chat UI and type your question.
5. The **AI Agent** uses the Qdrant tool, reads re-ranked context, and replies with memory from the last messages.

---

## Flow (simple)

```
Upload file  →  Qdrant (store)     [Ingestion]

Your question  →  AI Agent  →  Qdrant search  →  Cohere rerank  →  Groq answer  [Chat]
```

---

## Tips

- Run **ingestion** before **chat**, or the database will be empty.
- If upload does nothing, check that ingestion nodes are **enabled** and the workflow is **active**.
- Collection name must match: **`Advance_RAG`**.

---

## Files

| File | Purpose |
|------|---------|
| `AdvanceRAG.json` | Full n8n workflow export |

No extra code in this folder — everything runs inside n8n.
