import os
import sys
import subprocess
import platform

def build_backend():
    # Install PyInstaller if not already installed
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create dist directory if it doesn't exist
    dist_dir = os.path.join(current_dir, "dist")
    os.makedirs(dist_dir, exist_ok=True)
    
    # Ensure we're in the correct directory
    os.chdir(current_dir)
    
    # Build command
    build_cmd = [
        "pyinstaller",
        "--onefile",
        "--clean",
        "--name", "run",
        "--add-data", f"{os.path.join(current_dir, 'app')}{os.pathsep}app",
        os.path.join(current_dir, "run.py")
    ]
    
    # Add platform-specific options
    if platform.system() == "Windows":
        build_cmd.append("--noconsole")
    elif platform.system() == "Darwin":  # macOS
        build_cmd.append("--windowed")
    
    # Run the build command
    subprocess.check_call(build_cmd)

if __name__ == "__main__":
    build_backend() 