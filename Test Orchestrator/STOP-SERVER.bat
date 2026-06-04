@echo off
title Stop Test Orchestrator
echo Stopping whatever is listening on port 8000 (and 8001-8005)...
for %%P in (8000 8001 8002 8003 8004 8005) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING"') do (
    echo Killing PID %%a on port %%P
    taskkill /PID %%a /F 2>nul
  )
)
echo Done.
pause
