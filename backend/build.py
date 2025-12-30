import PyInstaller.__main__
import os
import sys
import shutil
import platform

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

def main():
    try:
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
            add_data_args.append(f'--add-data={src_path}{sep}{dst}')
        
        # Detect current platform
        current_platform = platform.system()
        print(f"Building for platform: {current_platform}")
        
        # PyInstaller arguments
        args = [
            app_path,
            '--onefile',
            '--noconsole',
            '--noconfirm',
            '--clean',
            '--name=flask_backend',
            '--exclude-module=matplotlib',  # Exclude matplotlib as it's not needed
            '--exclude-module=tkinter',     # Exclude tkinter as it's not needed
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
        ]
        
        # Add platform-specific runtime hooks
        if current_platform == 'Windows':
            args.extend([
                '--runtime-hook=windows_hook.py',
                '--additional-hooks-dir=.',
            ])
        elif current_platform == 'Darwin':
            args.extend([
                '--runtime-hook=mac_hook.py',
                '--additional-hooks-dir=.',
            ])
        elif current_platform == 'Linux':
            args.extend([
                '--runtime-hook=linux_hook.py',
                '--additional-hooks-dir=.',
            ])
        else:
            print(f"Warning: Unknown platform {current_platform}, building without platform-specific hooks")
        
        # Run PyInstaller
        PyInstaller.__main__.run(args)
        
        # Verify the build output
        if current_platform == 'Windows':
            exe_path = os.path.join(dist_path, 'flask_backend.exe')
        else:
            exe_path = os.path.join(dist_path, 'flask_backend')
        
        if os.path.exists(exe_path):
            size = os.path.getsize(exe_path) / (1024 * 1024)  # Size in MB
            print(f"Build completed successfully!")
            print(f"Executable: {exe_path}")
            print(f"Size: {size:.2f} MB")
            
            # On Unix-like systems, ensure executable has proper permissions
            if current_platform != 'Windows':
                try:
                    os.chmod(exe_path, 0o755)
                    print("Set executable permissions")
                except Exception as e:
                    print(f"Warning: Could not set executable permissions: {e}")
        else:
            print(f"Warning: Expected executable not found at {exe_path}")
            print("Build may have failed. Check PyInstaller output above.")
        
    except Exception as e:
        print(f"Error during build: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 