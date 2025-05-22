import os
import sys
import subprocess
import platform
import shutil

def run_command(cmd, cwd=None):
    try:
        subprocess.check_call(cmd, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {' '.join(cmd)}")
        print(f"Error details: {str(e)}")
        return False

def build_backend():
    print("Building Flask backend...")
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    return run_command([sys.executable, "build.py"], cwd=backend_dir)

def build_frontend():
    print("Building React frontend...")
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
    return run_command(["npm", "run", "build"], cwd=frontend_dir)

def build_electron():
    print("Building Electron app...")
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
    return run_command(["npm", "run", "build"], cwd=frontend_dir)

def main():
    # Store the original working directory
    original_dir = os.getcwd()
    
    try:
        # Build backend
        if not build_backend():
            print("Backend build failed!")
            return
        
        # Build frontend
        if not build_frontend():
            print("Frontend build failed!")
            return
        
        # Build electron app
        if not build_electron():
            print("Electron build failed!")
            return
        
        print("Build completed successfully!")
        
    except Exception as e:
        print(f"Build failed with error: {str(e)}")
    finally:
        # Restore original working directory
        os.chdir(original_dir)

if __name__ == "__main__":
    main() 