@echo off
rem Dev server for the portfolio (Vite, 127.0.0.1:5190 — this PC only). Close this window to stop it.
cd /d "%~dp0\.."
netstat -ano | findstr /r /c:":5190 .*LISTENING" >nul
if errorlevel 1 (
  npm run dev
) else (
  echo already listening on :5190
  pause
)
