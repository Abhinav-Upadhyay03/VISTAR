import os
import sys

def _setup_windows_paths():
    """Setup Windows-specific paths and environment variables."""
    if sys.platform.startswith('win'):
        # Add the current directory to PATH
        os.environ['PATH'] = os.path.dirname(sys.executable) + os.pathsep + os.environ['PATH']
        
        # Set DLL search path
        if hasattr(os, 'add_dll_directory'):
            os.add_dll_directory(os.path.dirname(sys.executable))

_setup_windows_paths() 