#!/usr/bin/env python3
"""
Windows build script for PyInstaller
This script builds the Flask backend for Windows from macOS
"""

import PyInstaller.__main__
import os
import sys
import shutil
import platform
import subprocess

def get_platform_specific_path(path):
    """Convert path to platform-specific format."""
    if platform.system() == 'Windows':
        return path.replace('/', '\\')
    return path

def clean_build_dirs():
    """Clean build and dist directories."""
    dirs_to_clean = ['build', 'dist']
    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"Cleaned {dir_name} directory")

def check_wine():
    """Check if Wine is available for Windows builds."""
    try:
        result = subprocess.run(['wine', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"Wine found: {result.stdout.strip()}")
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    print("Wine not found. Please install Wine to build Windows executables from macOS.")
    print("Install with: brew install --cask wine-stable")
    return False

def main():
    try:
        print("Building Flask backend for Windows...")
        
        # Check if we're on macOS and Wine is available
        if platform.system() == 'Darwin':
            if not check_wine():
                print("\nTo install Wine:")
                print("1. Install Homebrew if not already installed")
                print("2. Run: brew install --cask wine-stable")
                print("3. Run: winecfg (to configure Wine)")
                print("4. Re-run this script")
                sys.exit(1)
        
        # Get the absolute path to the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Clean previous builds
        clean_build_dirs()
        
        # Define the paths
        app_path = os.path.join(backend_dir, 'run.py')
        dist_path = os.path.join(backend_dir, 'dist')
        build_path = os.path.join(backend_dir, 'build')
        
        # Platform-specific separator
        sep = ';' if platform.system() == 'Windows' else ':'
        
        # Define data files with platform-specific paths
        data_files = [
            ('requirements.txt', '.'),
            ('app', 'app'),
            ('app/static/assets/color_map_crop.jpg', 'app/static/assets')
        ]
        
        # Convert data files to platform-specific format
        add_data_args = []
        for src, dst in data_files:
            src_path = os.path.join(backend_dir, src)
            if os.path.exists(src_path):
                add_data_args.append(f'--add-data={src_path}{sep}{dst}')
            else:
                print(f"Warning: {src_path} not found, skipping...")
        
        # PyInstaller arguments for Windows
        args = [
            app_path,
            '--onefile',
            '--noconsole',
            '--noconfirm',
            '--clean',
            '--name=flask_backend',
            '--exclude-module=matplotlib',
            '--exclude-module=tkinter',
            f'--distpath={dist_path}',
            f'--workpath={build_path}',
            *add_data_args,
            '--hidden-import=flask',
            '--hidden-import=flask_cors',
            '--hidden-import=numpy',
            '--hidden-import=pandas',
            '--hidden-import=scipy',
            '--hidden-import=cv2',
            '--hidden-import=networkx',
            '--hidden-import=skimage',
            '--hidden-import=skimage.io',
            '--hidden-import=skimage.io._plugins',
            '--hidden-import=skimage.io._plugins.pil_plugin',
            '--hidden-import=skimage.feature',
            '--hidden-import=skimage.filters',
            '--hidden-import=skimage.morphology',
            '--hidden-import=skimage.transform',
            '--hidden-import=skimage.util',
            '--hidden-import=PIL',
            '--runtime-hook=windows_hook.py',
            '--additional-hooks-dir=.',
        ]
        
        # Add Wine environment for cross-compilation
        env = os.environ.copy()
        if platform.system() == 'Darwin':
            env['WINEPREFIX'] = os.path.expanduser('~/.wine')
            env['WINEARCH'] = 'win64'
        
        print("Running PyInstaller...")
        print(f"Command: python -m PyInstaller {' '.join(args)}")
        
        # Run PyInstaller with Wine for Windows cross-compilation
        import subprocess
        import sys
        
        # Set Wine environment
        env = os.environ.copy()
        env['WINEPREFIX'] = os.path.expanduser('~/.wine')
        env['WINEARCH'] = 'win64'
        
        # Convert Python path to Wine path
        wine_python = 'python'
        
        # Run PyInstaller through Wine
        cmd = ['wine', wine_python, '-m', 'PyInstaller'] + args[1:]  # Skip the script path
        
        print(f"Running Wine command: {' '.join(cmd)}")
        result = subprocess.run(cmd, env=env, cwd=backend_dir)
        
        if result.returncode != 0:
            print(f"PyInstaller failed with return code {result.returncode}")
            sys.exit(1)
        
        print("\nBuild completed successfully!")
        print(f"Windows executable should be at: {os.path.join(dist_path, 'flask_backend.exe')}")
        
        # Verify the build
        exe_path = os.path.join(dist_path, 'flask_backend.exe')
        if os.path.exists(exe_path):
            size = os.path.getsize(exe_path) / (1024 * 1024)  # Size in MB
            print(f"Executable size: {size:.2f} MB")
        else:
            print("Warning: Executable not found after build!")
        
    except Exception as e:
        print(f"Error during build: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()