@echo off
title Silver Star - Auto Deploy
echo ==========================================================
echo Silver Star Platform - Auto Deploy to VPS
echo Target: 129.121.170.111 (root)
echo ==========================================================
echo.

set MSG=%*
if "%MSG%"=="" set MSG=deploy: automated build and release

echo 1. Compiling all frontend applications...
call npm run build:all
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed! Aborting deployment.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Staging all changes and pre-built bundles...
git add .

echo.
echo 3. Committing changes...
git commit -m "%MSG%"

echo.
echo 4. Pushing to GitHub origin main...
git push origin main
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git push failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo Deployment pushed to origin main!
echo Webhook at 129.121.170.111 will auto-pull and reload.
echo ==========================================================
echo.
pause
