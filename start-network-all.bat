@echo off
title Silver Star Platform - Network Host Launcher
echo ==========================================================
echo Starting Silver Star Platform on Local Network IP
echo ==========================================================

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP:~1%
echo Detected Network IP: %IP%
echo.

echo Launching Backend API on port 5000...
start "Silver Star Backend API (5000)" cmd /k "cd /d "%~dp0platform\backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Launching Super Admin on port 5173...
start "Silver Star Super Admin (5173)" cmd /k "cd /d "%~dp0platform\apps\super-admin" && npm run dev"

echo Launching HR Panel on port 5174...
start "Silver Star HR Panel (5174)" cmd /k "cd /d "%~dp0platform\apps\hr-panel" && npm run dev"

echo Launching Operations Panel on port 5175...
start "Silver Star Operations (5175)" cmd /k "cd /d "%~dp0platform\apps\operations-panel" && npm run dev"

echo Launching Client Mobile on port 5176...
start "Silver Star Client Mobile (5176)" cmd /k "cd /d "%~dp0platform\apps\client-mobile" && npm run dev"

echo Launching Employee Mobile on port 5177...
start "Silver Star Employee Mobile (5177)" cmd /k "cd /d "%~dp0platform\apps\employee-mobile" && npm run dev"

echo.
echo ==========================================================
echo All services launched!
echo Access from any device on your Wi-Fi:
echo   - Super Admin:       http://%IP%:5173
echo   - HR Panel:          http://%IP%:5174
echo   - Operations Panel:  http://%IP%:5175
echo   - Client Mobile:     http://%IP%:5176
echo   - Employee Mobile:   http://%IP%:5177
echo   - Backend API:       http://%IP%:5000
echo   - PostgreSQL DB:     %IP%:5432 (Database: silverstardb)
echo ==========================================================
pause

