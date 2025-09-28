#!/bin/bash

# Windows Build Script for VISTAR
# This script builds the complete Windows distributable from macOS

set -e  # Exit on any error

echo "🚀 Starting VISTAR Windows Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed to run on macOS"
    exit 1
fi

# Check if Wine is installed
if ! command -v wine &> /dev/null; then
    print_error "Wine is not installed. Please install it first:"
    echo "brew install --cask wine-stable"
    exit 1
fi

print_success "Wine found: $(wine --version)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first:"
    echo "brew install node"
    exit 1
fi

print_success "Node.js found: $(node --version)"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install it first:"
    echo "brew install python"
    exit 1
fi

print_success "Python3 found: $(python3 --version)"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

print_status "Project root: $PROJECT_ROOT"

# Step 1: Install frontend dependencies
print_status "Step 1: Installing frontend dependencies..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi

# Step 2: Build frontend
print_status "Step 2: Building frontend..."
npm run build
print_success "Frontend built successfully"

# Step 3: Install backend dependencies
print_status "Step 3: Installing backend dependencies..."
cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate
print_success "Virtual environment activated"

# Install dependencies
pip install -r requirements.txt
print_success "Backend dependencies installed"

# Step 4: Build Windows backend executable
print_status "Step 4: Building Windows backend executable..."
python3 build_windows.py
print_success "Windows backend executable built"

# Step 5: Build Windows Electron app
print_status "Step 5: Building Windows Electron app..."
cd "$FRONTEND_DIR"

# Set environment variables for Windows build
export WINEPREFIX="$HOME/.wine"
export WINEARCH="win64"

# Build for Windows
npm run build -- --win --x64
print_success "Windows Electron app built"

# Step 6: Verify build outputs
print_status "Step 6: Verifying build outputs..."

# Check backend executable
if [ -f "$BACKEND_DIR/dist/flask_backend.exe" ]; then
    BACKEND_SIZE=$(du -h "$BACKEND_DIR/dist/flask_backend.exe" | cut -f1)
    print_success "Backend executable: $BACKEND_DIR/dist/flask_backend.exe ($BACKEND_SIZE)"
else
    print_error "Backend executable not found!"
    exit 1
fi

# Check Electron build
if [ -d "$FRONTEND_DIR/electron-dist" ]; then
    print_success "Electron build directory: $FRONTEND_DIR/electron-dist"
    ls -la "$FRONTEND_DIR/electron-dist/"
else
    print_error "Electron build directory not found!"
    exit 1
fi

print_success "🎉 Windows build completed successfully!"
print_status "Build outputs:"
echo "  - Backend executable: $BACKEND_DIR/dist/flask_backend.exe"
echo "  - Electron app: $FRONTEND_DIR/electron-dist/"
echo ""
print_status "You can now distribute the Windows installer from the electron-dist directory"