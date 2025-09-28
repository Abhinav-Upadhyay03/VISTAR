# VISTAR Windows Build Guide

This guide will help you create a Windows distributable of VISTAR from macOS.

## Prerequisites

Before building, ensure you have the following installed:

### 1. Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Wine (for cross-platform Windows builds)

```bash
brew install --cask wine-stable
```

### 3. Node.js

```bash
brew install node
```

### 4. Python 3

```bash
brew install python
```

## Build Process

### Option 1: Automated Build (Recommended)

Run the automated build script:

```bash
cd /Users/abhinav/Documents/VISTAR
./build_windows.sh
```

### Option 2: Manual Build Steps

#### Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Build Frontend

```bash
npm run build
```

#### Step 3: Build Windows Backend

```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 build_windows.py
```

#### Step 4: Build Windows Electron App

```bash
cd ../frontend
npm run build:win
```

## Build Outputs

After successful build, you'll find:

- **Backend Executable**: `backend/dist/flask_backend.exe`
- **Windows Installer**: `frontend/electron-dist/Vistar-Setup-0.1.2.exe`
- **Portable Version**: `frontend/electron-dist/Vistar-0.1.2.exe`
- **ZIP Archive**: `frontend/electron-dist/Vistar-0.1.2.zip`

## Troubleshooting

### Wine Issues

If Wine is not working properly:

```bash
# Configure Wine
winecfg

# Install Windows dependencies
winetricks vcrun2019
winetricks python39
```

### Build Failures

1. **Clean previous builds**:

   ```bash
   cd frontend && npm run clean
   cd ../backend && rm -rf build dist
   ```

2. **Reinstall dependencies**:
   ```bash
   cd frontend && rm -rf node_modules && npm install
   cd ../backend && rm -rf venv && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
   ```

### PyInstaller Issues

If PyInstaller fails:

```bash
# Install additional dependencies
pip install pyinstaller[encryption]
pip install --upgrade pip setuptools wheel
```

## Distribution

The Windows installer (`Vistar-Setup-0.1.2.exe`) can be distributed to Windows users. It will:

- Install VISTAR in Program Files
- Create desktop shortcuts
- Register the application
- Include the Flask backend executable

## Testing

To test the Windows build on macOS:

```bash
# Install Windows Python in Wine
winetricks python39

# Test the backend executable
wine backend/dist/flask_backend.exe
```

## Notes

- The build process uses Wine to create Windows executables from macOS
- The Flask backend is packaged as a single executable using PyInstaller
- The Electron app includes the backend executable as an extra resource
- All builds target Windows x64 architecture
