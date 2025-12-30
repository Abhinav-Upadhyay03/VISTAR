@echo off
REM VISTAR Windows Build Script
REM Run this script on a Windows machine to build the Windows executable

echo ========================================
echo VISTAR Windows Build Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ and add it to PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and add it to PATH
    pause
    exit /b 1
)

echo [1/5] Setting up Python virtual environment...
cd backend
if exist venv (
    echo Virtual environment already exists, skipping creation...
) else (
    python -m venv venv
)
call venv\Scripts\activate.bat

echo [2/5] Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller

echo [3/5] Building backend executable...
python build.py
if errorlevel 1 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)

if not exist dist\flask_backend.exe (
    echo ERROR: Backend executable not found after build!
    pause
    exit /b 1
)

echo Backend executable created successfully!
echo.

cd ..\frontend

echo [4/5] Installing frontend dependencies...
call npm ci
if errorlevel 1 (
    echo ERROR: Frontend dependency installation failed!
    pause
    exit /b 1
)

echo [5/5] Building Electron app for Windows...
call npm run build:win
if errorlevel 1 (
    echo ERROR: Electron build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Your Windows executables are in: frontend\electron-dist\
echo.
echo Files created:
dir /b frontend\electron-dist\*.exe 2>nul
dir /b frontend\electron-dist\*.zip 2>nul
echo.
pause

