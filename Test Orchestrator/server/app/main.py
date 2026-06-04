from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers import generate, jira, llm

# Docs under /api/* only
app = FastAPI(
    title="Test Orchestrator API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
_DIST = _REPO_ROOT / "web" / "dist"
_ASSETS = _DIST / "assets"

_NO_CACHE_HTML = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
}


def _dist_ready() -> bool:
    return _DIST.is_dir() and (_DIST / "index.html").is_file()


def _safe_dist_file(relative: str) -> Path | None:
    if not relative or ".." in relative:
        return None
    p = (_DIST / relative).resolve()
    try:
        p.relative_to(_DIST.resolve())
    except ValueError:
        return None
    return p if p.is_file() else None


@app.middleware("http")
async def spa_fallback(request: Request, call_next):
    """
    React Router: refresh on /jira etc. must return index.html.
    A path-only catch-all can shadow /api/* in some Starlette versions; this runs *after* routing
    and only fixes 404 GETs that are not API or hashed assets.
    """
    response = await call_next(request)
    if request.method != "GET" or response.status_code != 404:
        return response
    path = request.url.path
    if path.startswith("/api") or path.startswith("/assets"):
        return response
    if not _dist_ready():
        return response
    rel = path.lstrip("/")
    if rel:
        f = _safe_dist_file(rel)
        if f is not None:
            return FileResponse(f)
    return FileResponse(_DIST / "index.html", headers=_NO_CACHE_HTML)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5180",
        "http://127.0.0.1:5180",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jira.router)
app.include_router(llm.router)
app.include_router(generate.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


if _dist_ready() and _ASSETS.is_dir():
    app.mount("/assets", StaticFiles(directory=str(_ASSETS)), name="assets")

    @app.get("/", include_in_schema=False)
    def serve_index():
        return FileResponse(_DIST / "index.html", headers=_NO_CACHE_HTML)

else:

    @app.get("/", include_in_schema=False)
    def root_build_hint():
        return {
            "message": "Web UI is not built yet.",
            "fix": "Run: cd web && npm install && npm run build",
            "then": "Open this same URL again (http://127.0.0.1:8000)",
            "api_health": "/api/health",
            "api_docs": "/api/docs",
        }
