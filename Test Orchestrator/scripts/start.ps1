# Same as double-clicking START.bat: builds UI, starts server, opens browser
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
npm start
