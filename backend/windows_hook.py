import os
import sys
import site

def _setup_windows_paths():
    # Get the base directory of the executable
    if getattr(sys, 'frozen', False):
        base_dir = os.path.dirname(sys.executable)
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    # Add the base directory to sys.path
    if base_dir not in sys.path:
        sys.path.insert(0, base_dir)

    # Add the app directory to sys.path
    app_dir = os.path.join(base_dir, 'app')
    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)

    # Set environment variables
    os.environ['FLASK_APP'] = 'run.py'
    os.environ['FLASK_ENV'] = 'production'

_setup_windows_paths() 