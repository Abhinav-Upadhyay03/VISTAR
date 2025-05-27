import sys
import time
import socket
import logging
import atexit
from app import create_app
from windows_hook import _setup_windows_paths  # Import Windows hook

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def cleanup():
    """Cleanup function to be called on exit"""
    logger.info("Cleaning up resources...")
    try:
        # Add any cleanup code here
        pass
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

def find_available_port(start_port=5001, max_attempts=10):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))  # Bind to localhost explicitly
                return port
        except OSError:
            continue
    raise RuntimeError(f"Could not find an available port after {max_attempts} attempts")

def main():
    try:
        start = time.time()
        logger.info("Starting backend...")

        # Register cleanup function
        atexit.register(cleanup)

        # Setup Windows-specific configurations
        _setup_windows_paths()

        app = create_app()
        logger.info(f"App created in {time.time() - start:.2f} seconds")

        # Only enable debug in development
        debug = not getattr(sys, 'frozen', False)
        port = find_available_port()
        logger.info(f"Using port: {port}")
        logger.info(f"About to run app after {time.time() - start:.2f} seconds")
        
        app.run(debug=debug, port=port, host='127.0.0.1')  # Explicitly set host to localhost
    except Exception as e:
        logger.error(f"Error starting backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
