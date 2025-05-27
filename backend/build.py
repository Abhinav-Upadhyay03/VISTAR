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
        
        # Add platform-specific arguments
        if platform.system() == 'Windows':
            args.extend([
                '--runtime-hook=windows_hook.py',
                '--additional-hooks-dir=.',
            ])
        
        # Run PyInstaller
        PyInstaller.__main__.run(args)
        
        print("Build completed successfully!")
        
    except Exception as e:
        print(f"Error during build: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 