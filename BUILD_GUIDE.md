# VISTAR Build Guide

This guide explains how to build VISTAR for Windows, macOS, and Linux.

## Overview

VISTAR uses a unified build system that:
- Automatically detects your platform
- Builds native executables (no cross-compilation needed)
- Packages everything into distributable installers

## Prerequisites

### All Platforms
- Node.js 18+ and npm
- Python 3.10+
- Git

### Platform-Specific Requirements

#### Windows
- Visual Studio Build Tools or Windows SDK
- Python 3.10 installed and in PATH

#### macOS
- Xcode Command Line Tools: `xcode-select --install`
- Python 3.10 (via Homebrew recommended)

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y python3-dev python3-pip python3-venv
sudo apt-get install -y build-essential
sudo apt-get install -y libgl1-mesa-glx libglib2.0-0 libgtk-3-dev
```

## Building Locally

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install pyinstaller
```

### Step 2: Build Backend

The backend build script automatically detects your platform and builds the appropriate executable:

```bash
cd backend
python build.py
```

This will create:
- **Windows**: `dist/flask_backend.exe`
- **macOS/Linux**: `dist/flask_backend`

### Step 3: Build Electron App

```bash
cd ../frontend

# Build for your current platform
npm run build

# Or build for a specific platform:
npm run build:win    # Windows
npm run build:mac    # macOS (macOS only)
npm run build:linux   # Linux (Linux only)
```

### Step 4: Find Your Distributables

Check `frontend/electron-dist/` for your built files:

- **Windows**: `.exe` installer, portable `.exe`, `.zip`
- **macOS**: `.dmg`, `.zip`
- **Linux**: `.AppImage`, `.zip`

## Automated Builds (GitHub Actions)

The easiest way to build for all platforms is using GitHub Actions:

1. Push your code to the repository
2. GitHub Actions automatically builds for Windows, macOS, and Linux
3. Download artifacts from the Actions tab

### Creating a Release

To create a GitHub release with all platform builds:

1. Go to **Actions** → **Build and Release**
2. Click **Run workflow**
3. Select **Create a release: true**
4. Click **Run workflow**

This will:
- Build for all platforms
- Create a GitHub release
- Upload all distributables to the release

## Troubleshooting

### Backend Build Issues

**Problem**: PyInstaller fails to find modules
- **Solution**: Ensure all dependencies are installed: `pip install -r requirements.txt`

**Problem**: Executable not found after build
- **Solution**: Check `backend/dist/` directory. On Unix systems, ensure executable permissions: `chmod +x backend/dist/flask_backend`

### Electron Build Issues

**Problem**: electron-builder fails
- **Solution**: Clean and rebuild: `npm run clean && npm install && npm run build`

**Problem**: Backend not found in packaged app
- **Solution**: Ensure `backend/dist/` contains the executable before building Electron app

### Platform-Specific Issues

#### Windows
- Ensure Python is in PATH
- Install Visual C++ Redistributables if needed

#### macOS
- Code signing may be required for distribution outside App Store
- Gatekeeper may block unsigned apps (right-click → Open)

#### Linux
- Ensure all system libraries are installed (see Prerequisites)
- AppImage may need `chmod +x` to be executable

## Build Scripts Reference

### Frontend Scripts (`frontend/package.json`)

- `npm run build` - Build for current platform
- `npm run build:win` - Build Windows distributables
- `npm run build:mac` - Build macOS distributables
- `npm run build:linux` - Build Linux distributables
- `npm run build-backend` - Build backend executable
- `npm run build-all` - Build backend + Electron app
- `npm run clean` - Clean build directories

### Backend Scripts

- `python build.py` - Build backend executable for current platform

## Architecture Notes

- **Backend**: PyInstaller creates a single-file executable
- **Frontend**: electron-builder packages Electron app with backend
- **Platform Detection**: Runtime detection in `electron.js` and `run.py`
- **Hooks**: Platform-specific initialization in `*_hook.py` files

## Next Steps

After building:
1. Test the application locally
2. Verify backend starts correctly
3. Check all features work as expected
4. Distribute via GitHub Releases or your preferred method

