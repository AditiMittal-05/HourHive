@echo off
title HourHive - FRONTEND - Port 5173
color 0E

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend

echo.
echo  ==========================================
echo   HourHive - Frontend
echo   http://localhost:5173
echo  ==========================================
echo.

if not exist "%FRONTEND%\node_modules" (
    echo  [SETUP] Installing npm packages, please wait...
    cd /d "%FRONTEND%"
    npm install
    echo  [SETUP] Done installing packages.
    echo.
)

cd /d "%FRONTEND%"
echo  Starting Vite dev server...
echo.
npm run dev -- --host
