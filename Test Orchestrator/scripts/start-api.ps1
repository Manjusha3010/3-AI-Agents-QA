# API only (no bundled UI). Prefer .\scripts\start.ps1 for the full app on http://127.0.0.1:8000
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$server = Join-Path $root "server"
Set-Location $server
if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creating venv and installing deps (first run)..."
    python -m venv .venv
    & .\.venv\Scripts\pip install -r requirements.txt
}
Write-Host "API: http://127.0.0.1:8000  |  Docs: http://127.0.0.1:8000/api/docs"
Write-Host "Tip: run ..\scripts\start.ps1 to build the UI and serve everything on one port."
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
