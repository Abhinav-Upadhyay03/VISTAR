import os
import sys
import logging

logger = logging.getLogger(__name__)

def _setup_paths():
    """Setup necessary paths for the application"""
    if getattr(sys, 'frozen', False):
        # Get the path of the PyInstaller bundle
        bundle_dir = sys._MEIPASS
        
        # Add the bundle directory to PATH
        os.environ['PATH'] = bundle_dir + os.pathsep + os.environ.get('PATH', '')
        
        # Add bundle directory to Python path
        if bundle_dir not in sys.path:
            sys.path.insert(0, bundle_dir)
            
        logger.info(f"Added bundle directory to PATH and PYTHONPATH: {bundle_dir}")

def _setup_mac_paths():
    """Setup macOS-specific paths and environment variables"""
    try:
        _setup_paths()
        
        # macOS-specific configurations
        # Ensure proper library paths for macOS
        if 'DYLD_LIBRARY_PATH' not in os.environ:
            os.environ['DYLD_LIBRARY_PATH'] = ''
        
        # Pre-import core modules
        core_modules = [
            'numpy',
            'PIL',
            'skimage.io',
            'skimage.transform',
            'skimage.util'
        ]
        
        for module in core_modules:
            try:
                __import__(module)
                logger.info(f"Successfully imported {module}")
            except ImportError as e:
                logger.warning(f"Warning: Failed to import {module}: {e}")
                
    except Exception as e:
        logger.error(f"Error setting up macOS paths: {e}")
        # Don't raise the exception, just log it
        pass

# Initialize when module is loaded
_setup_mac_paths()

