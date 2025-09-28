#!/bin/bash

# Prerequisites Installation Script for VISTAR Windows Build
# This script installs all required dependencies on macOS

set -e

echo "🔧 Installing prerequisites for VISTAR Windows build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Homebrew if not present
if ! command_exists brew; then
    print_status "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    print_success "Homebrew installed"
else
    print_success "Homebrew already installed"
fi

# Install Wine
if ! command_exists wine; then
    print_status "Installing Wine..."
    brew install --cask wine-stable
    print_success "Wine installed"
else
    print_success "Wine already installed: $(wine --version)"
fi

# Install Node.js
if ! command_exists node; then
    print_status "Installing Node.js..."
    brew install node
    print_success "Node.js installed"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Install Python 3
if ! command_exists python3; then
    print_status "Installing Python 3..."
    brew install python
    print_success "Python 3 installed"
else
    print_success "Python 3 already installed: $(python3 --version)"
fi

# Configure Wine
print_status "Configuring Wine..."
if [ ! -d "$HOME/.wine" ]; then
    winecfg
    print_success "Wine configured"
else
    print_success "Wine already configured"
fi

# Install Windows dependencies in Wine
print_status "Installing Windows dependencies in Wine..."
winetricks vcrun2019 python39
print_success "Windows dependencies installed"

print_success "🎉 All prerequisites installed successfully!"
print_status "You can now run: ./build_windows.sh"