@echo off
setlocal
echo =======================================================
echo   Launching CHILLMODE - Intelligence Meets Music
echo =======================================================
cd /d "%~dp0backend"
set "PATH=C:\Users\LAPTOP\.gemini\antigravity\bin;%PATH%"

echo Starting CHILLMODE Unified Engine on http://localhost:5000 ...
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000"
node dist/index.js
if errorlevel 1 (
  echo.
  echo [ERROR] Server encountered an error. Press any key to exit.
  pause
)


