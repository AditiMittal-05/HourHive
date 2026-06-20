@echo off
title HourHive Launcher
color 0A

echo.
echo  ==========================================
echo   HourHive - gNxt Systems
echo   Starting backend and frontend...
echo  ==========================================
echo.

echo [1/2] Opening Backend Server...
start "HourHive - BACKEND - Port 8000" cmd /k "%~dp0start_backend.bat"

echo Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak >nul

echo [2/2] Opening Frontend...
start "HourHive - FRONTEND - Port 5173" cmd /k "%~dp0start_frontend.bat"

echo.
echo ==========================================
echo   Both windows are now opening.
echo.
echo   Once the frontend window shows:
echo     VITE ready in ... ms
echo   Then open: http://localhost:5173
echo.
echo   API Docs: http://localhost:8000/docs
echo.
echo   Keep BOTH black windows open while using.
echo   To stop: close both black windows.
echo ==========================================
echo.
echo Waiting 30 seconds then auto-opening browser...
timeout /t 30 /nobreak >nul
start "" "http://localhost:5173"
