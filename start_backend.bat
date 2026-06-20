@echo off
title HourHive - BACKEND - Port 8000
color 0B

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set VENV=%BACKEND%\venv\Scripts

echo.
echo  ==========================================
echo   HourHive - Backend
echo   http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo  ==========================================
echo.

:: Find Python - try py launcher first, then common paths
set PYTHON=
where py >nul 2>&1 && set PYTHON=py
if "%PYTHON%"=="" (
    if exist "C:\Users\dell_1\AppData\Local\Programs\Python\Python312\python.exe" (
        set PYTHON=C:\Users\dell_1\AppData\Local\Programs\Python\Python312\python.exe
    )
)
if "%PYTHON%"=="" where python >nul 2>&1 && set PYTHON=python
if "%PYTHON%"=="" (
    echo  [ERROR] Python not found. Install Python 3.10+ and try again.
    pause
    exit /b 1
)

if not exist "%BACKEND%\venv" (
    echo  [SETUP] Creating Python venv...
    "%PYTHON%" -m venv "%BACKEND%\venv"
    echo  [SETUP] Venv created.
    echo.
)

if not exist "%VENV%\uvicorn.exe" (
    echo  [SETUP] Installing Python packages, please wait...
    "%VENV%\pip.exe" install -r "%BACKEND%\requirements.txt" --disable-pip-version-check
    echo  [SETUP] Done installing packages.
    echo.
)

echo  [DB] Ensuring database exists...
"%VENV%\python.exe" -c "import pymysql;c=pymysql.connect(host='localhost',user='root',password='root',port=3306);c.cursor().execute('CREATE DATABASE IF NOT EXISTS hourhive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');c.commit();c.close()" 2>nul
echo  [DB] Running migrations...
cd /d "%BACKEND%"
"%VENV%\python.exe" -m alembic upgrade head
echo.

echo  [SERVER] Starting FastAPI...
echo.
"%VENV%\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
