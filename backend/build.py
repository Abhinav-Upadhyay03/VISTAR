import PyInstaller.__main__
import os
import sys

# Get the absolute path to the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))

# Define the paths
app_path = os.path.join(backend_dir, 'run.py')
dist_path = os.path.join(backend_dir, 'dist')
build_path = os.path.join(backend_dir, 'build')

# PyInstaller arguments
args = [
    app_path,
    '--onefile',
    '--noconsole',
    '--name=flask_backend',
    f'--distpath={dist_path}',
    f'--workpath={build_path}',
    '--add-data=requirements.txt:.',
    '--add-data=app:app',
    '--add-data=app/static/assets/color_map_crop.jpg:app/static/assets',
    '--hidden-import=flask',
    '--hidden-import=flask_cors',
    '--hidden-import=numpy',
    '--hidden-import=pandas',
    '--hidden-import=scipy',
    '--hidden-import=opencv-python',
    '--hidden-import=networkx',
    '--hidden-import=scikit-image',
]

# Run PyInstaller
PyInstaller.__main__.run(args) 