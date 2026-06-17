@echo off
title HourHive Launcher
color 0A

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend
set PYTHON=C:\Users\dell_1\AppData\Local\Programs\Python\Python312\python.exe
set VENV=%BACKEND%\venv\Scripts

echo.
echo  HourHive - gNxt Systems
echo  Starting backend and frontend...
echo.

:: ── First-time setup (skipped automatically if already done) ──────────────────

if not exist "%BACKEND%\venv" (
    echo  [SETUP] Creating Python venv...
    "%PYTHON%" -m venv "%BACKEND%\venv"
)

if not exist "%VENV%\uvicorn.exe" (
    echo  [SETUP] Installing Python packages (first run only)...
    "%VENV%\pip.exe" install -r "%BACKEND%\requirements.txt" -q --disable-pip-version-check
)

"%VENV%\python.exe" -c "import pymysql;c=pymysql.connect(host='localhost',user='root',password='root',port=3306);c.cursor().execute('CREATE DATABASE IF NOT EXISTS hourhive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');c.commit();c.close()" 2>nul

cd /d "%BACKEND%"
"%VENV%\python.exe" -m alembic upgrade head >nul 2>&1

if not exist "%FRONTEND%\node_modules" (
    echo  [SETUP] Installing npm packages (first run only)...
    cd /d "%FRONTEND%"
    npm install --silent
)

:: ── Launch both servers in separate terminals ─────────────────────────────────

start "HourHive  |  BACKEND  :8000" cmd /k "color 0B && echo. && echo  BACKEND  ^|  http://localhost:8000 && echo  API Docs ^|  http://localhost:8000/docs && echo. && cd /d "%BACKEND%" && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

start "HourHive  |  FRONTEND  :5173" cmd /k "color 0E && echo. && echo  FRONTEND ^|  http://localhost:5173 && echo. && cd /d "%FRONTEND%" && npm run dev"

echo  Backend  ^>  http://localhost:8000
echo  Frontend ^>  http://localhost:5173
echo  API Docs ^>  http://localhost:8000/docs
echo.
echo  Both servers are running in their own windows.
echo  Press any key to close this launcher.
echo.
pause >nul
