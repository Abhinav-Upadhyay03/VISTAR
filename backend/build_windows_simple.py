#!/usr/bin/env python3
"""
Windows Flask Backend Build Script
Creates a Windows executable using PyInstaller with Wine
"""

import os
import sys
import subprocess
import shutil
import platform

def main():
    print("🔧 Building Flask Backend for Windows...")
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Clean previous builds
    for dir_name in ['build', 'dist']:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"Cleaned {dir_name} directory")
    
    # Set up paths
    app_path = os.path.join(backend_dir, 'run.py')
    dist_path = os.path.join(backend_dir, 'dist')
    
    # Create a simple batch script to run the Flask app
    batch_content = '''@echo off
cd /d "%~dp0"
python run.py
pause
'''
    
    batch_path = os.path.join(backend_dir, 'run_flask.bat')
    with open(batch_path, 'w') as f:
        f.write(batch_content)
    
    print("✅ Created Windows batch script")
    
    # For now, let's create a simple solution
    # We'll package the Python source and create a launcher
    print("📦 Creating Windows package...")
    
    # Create a simple Windows executable using cx_Freeze or similar
    # For now, let's create a simple solution that works
    
    # Create a simple Python launcher
    launcher_content = '''import sys
import os
import subprocess

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Change to the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Import and run the Flask app
try:
    from run import main
    main()
except Exception as e:
    print(f"Error starting Flask app: {e}")
    input("Press Enter to exit...")
'''
    
    launcher_path = os.path.join(backend_dir, 'launcher.py')
    with open(launcher_path, 'w') as f:
        f.write(launcher_content)
    
    print("✅ Created Python launcher")
    
    # Now let's try to create a Windows executable using PyInstaller with Wine
    print("🍷 Attempting to build Windows executable with Wine...")
    
    # Set Wine environment
    env = os.environ.copy()
    env['WINEPREFIX'] = os.path.expanduser('~/.wine')
    env['WINEARCH'] = 'win64'
    
    # PyInstaller command for Windows
    pyinstaller_cmd = [
        'wine', 'python', '-m', 'PyInstaller',
        '--onefile',
        '--noconsole',
        '--name=flask_backend',
        '--distpath=dist',
        '--workpath=build',
        '--add-data=app;app',
        '--add-data=requirements.txt;.',
        '--hidden-import=flask',
        '--hidden-import=flask_cors',
        '--hidden-import=numpy',
        '--hidden-import=pandas',
        '--hidden-import=scipy',
        '--hidden-import=cv2',
        '--hidden-import=skimage',
        '--hidden-import=PIL',
        'run.py'
    ]
    
    try:
        print(f"Running: {' '.join(pyinstaller_cmd)}")
        result = subprocess.run(pyinstaller_cmd, cwd=backend_dir, env=env, 
                              capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print("✅ Windows executable built successfully!")
            exe_path = os.path.join(dist_path, 'flask_backend.exe')
            if os.path.exists(exe_path):
                size = os.path.getsize(exe_path) / (1024 * 1024)
                print(f"📁 Executable: {exe_path} ({size:.2f} MB)")
            else:
                print("⚠️  Executable not found, but build completed")
        else:
            print(f"❌ PyInstaller failed: {result.stderr}")
            print("🔄 Falling back to alternative method...")
            create_fallback_solution(backend_dir)
            
    except subprocess.TimeoutExpired:
        print("⏰ PyInstaller timed out, using fallback method...")
        create_fallback_solution(backend_dir)
    except Exception as e:
        print(f"❌ Error running PyInstaller: {e}")
        print("🔄 Using fallback method...")
        create_fallback_solution(backend_dir)

def create_fallback_solution(backend_dir):
    """Create a fallback solution that works on Windows"""
    print("🔧 Creating fallback solution...")
    
    # Create a simple Windows batch file that runs Python
    batch_content = '''@echo off
echo Starting VISTAR Backend...
cd /d "%~dp0"
python run.py
if errorlevel 1 (
    echo Error starting backend. Make sure Python is installed.
    pause
)
'''
    
    batch_path = os.path.join(backend_dir, 'dist', 'flask_backend.bat')
    os.makedirs(os.path.dirname(batch_path), exist_ok=True)
    
    with open(batch_path, 'w') as f:
        f.write(batch_content)
    
    # Copy the entire backend to dist for packaging
    dist_backend = os.path.join(backend_dir, 'dist', 'backend')
    if os.path.exists(dist_backend):
        shutil.rmtree(dist_backend)
    
    shutil.copytree(backend_dir, dist_backend, 
                   ignore=shutil.ignore_patterns('venv', 'build', 'dist', '__pycache__', '*.pyc'))
    
    print("✅ Fallback solution created")
    print("📁 Backend files copied to dist/backend/")
    print("📁 Batch file created: dist/flask_backend.bat")

if __name__ == '__main__':
    main()