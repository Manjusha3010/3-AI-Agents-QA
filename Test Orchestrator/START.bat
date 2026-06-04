@echo off
title Test Orchestrator - setup
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js from https://nodejs.org then try again.
  pause
  exit /b 1
)

node start.mjs
set ERR=%ERRORLEVEL%

if %ERR% neq 0 (
  echo.
  echo If it failed, open: start-error.log
  pause
  exit /b %ERR%
)

echo.
echo You can close THIS window. The server keeps running in the other window.
echo To stop later: double-click STOP-SERVER.bat
timeout /t 8
exit /b 0
