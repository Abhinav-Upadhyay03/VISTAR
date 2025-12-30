# Vistar

Vistar is a modern image processing application built with Electron, React, and Flask. It provides a user-friendly interface for advanced image manipulation and processing capabilities.

## Features

- Modern, responsive user interface built with React and Tailwind CSS
- Cross-platform desktop application using Electron
- Advanced image processing capabilities powered by Flask backend
- Real-time image manipulation and preview
- Support for various image formats
- Automatic updates through GitHub releases

## Tech Stack

### Frontend
- React 18
- Electron
- Vite
- Tailwind CSS
- Framer Motion (for animations)
- React Router DOM
- Axios for API calls

### Backend
- Flask
- OpenCV
- NumPy
- Pandas
- scikit-image
- Pillow

## Prerequisites

- Node.js (v18 or higher)
- Python 3.10 or higher
- Git
- Platform-specific build tools (for local builds):
  - **Windows**: Visual Studio Build Tools or Windows SDK
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: Build essentials (`sudo apt-get install build-essential`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Abhinav-Upadhyay03/VISTAR.git
cd VISTAR
```

2. Set up the frontend:
```bash
cd frontend
npm install
```

3. Set up the backend:
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
```

4. Create environment files:
   - Create `frontend/.env` based on `frontend/.env.example`
   - Create `backend/.env` based on `backend/.env.example`

## Development

1. Start the development server:
```bash
# In the frontend directory
npm run dev
```

This will start both the frontend development server and the Electron app in development mode.

## Building

VISTAR uses a unified cross-platform build system that automatically detects your platform and builds the appropriate distributables.

### Automated Builds (GitHub Actions)

The project uses GitHub Actions to automatically build for all platforms (Windows, macOS, Linux) on every push to the main branch. Build artifacts are available in the Actions tab.

To trigger a manual build with release:
1. Go to Actions → Build and Release
2. Click "Run workflow"
3. Select "Create a release: true" to create a GitHub release

### Local Building

#### Build for Current Platform

```bash
# Build both backend and frontend for your current platform
cd frontend
npm run build-all

# Or build separately:
npm run build-backend  # Build backend executable
npm run build          # Build Electron app for current platform
```

#### Platform-Specific Builds

```bash
# Build for Windows (from any platform)
npm run build:win

# Build for macOS (from macOS only)
npm run build:mac

# Build for Linux (from Linux only)
npm run build:linux
```

**Note**: Cross-platform builds (building Windows from macOS/Linux) require native runners. For best results, use GitHub Actions or build on the target platform.

### Build Outputs

After building, distributables will be in `frontend/electron-dist/`:

- **Windows**: `Vistar-Setup-{version}.exe` (NSIS installer), `Vistar-{version}.exe` (portable), `Vistar-{version}.zip`
- **macOS**: `Vistar-{version}.dmg`, `Vistar-{version}-mac.zip`
- **Linux**: `Vistar-{version}.AppImage`, `Vistar-{version}-linux.zip`

The backend executable is automatically bundled with the Electron app in the `flask_backend` resource folder.

## Project Structure

```
Vistar/
├── frontend/              # Electron + React frontend
│   ├── src/              # React source code
│   ├── public/           # Static assets
│   ├── electron.js       # Electron main process (with platform detection)
│   └── package.json      # Build configuration
├── backend/              # Flask backend
│   ├── app/              # Flask application
│   ├── build.py          # Unified cross-platform build script
│   ├── run.py            # Backend entry point (with platform hooks)
│   ├── windows_hook.py   # Windows-specific initialization
│   ├── mac_hook.py       # macOS-specific initialization
│   ├── linux_hook.py     # Linux-specific initialization
│   └── dist/             # Built backend executables
├── .github/
│   └── workflows/
│       └── build.yml     # GitHub Actions CI/CD pipeline
└── README.md
```

## Architecture

VISTAR is an offline desktop application that:

1. **Starts a local Flask server** when the app launches
2. **Automatically detects the platform** (Windows/macOS/Linux) at runtime
3. **Launches the appropriate backend executable** for the current platform
4. **Serves the React frontend** through Electron

The backend is packaged as a platform-specific executable using PyInstaller, and the entire application is bundled using electron-builder.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- **Abhinav Upadhyay** - [GitHub Profile](https://github.com/Abhinav-Upadhyay03)

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries 