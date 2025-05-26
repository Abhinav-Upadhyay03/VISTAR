import sys
import time
import socket
import os
import logging
from app import create_app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def find_available_port(start_port=5000, max_attempts=10):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))  # Bind to localhost only
                return port
        except OSError:
            continue
    raise RuntimeError(f"Could not find an available port after {max_attempts} attempts")

def setup_environment():
    """Setup environment variables and paths"""
    if getattr(sys, 'frozen', False):
        # Running in a bundle
        base_dir = os.path.dirname(sys.executable)
    else:
        # Running in normal Python environment
        base_dir = os.path.dirname(os.path.abspath(__file__))

    # Add necessary paths
    if base_dir not in sys.path:
        sys.path.insert(0, base_dir)

    # Set environment variables
    os.environ['FLASK_APP'] = 'run.py'
    os.environ['FLASK_ENV'] = 'production'

def main():
    try:
        start = time.time()
        logger.info("Starting backend...")

        # Setup environment
        setup_environment()

        # Create Flask app
        app = create_app()
        logger.info(f"App created in {time.time() - start:.2f} seconds")

        # Find available port
        port = find_available_port()
        logger.info(f"Using port: {port}")

        # Run the app
        logger.info(f"About to run app after {time.time() - start:.2f} seconds")
        app.run(host='127.0.0.1', port=port, debug=False)
    except Exception as e:
        logger.error(f"Error starting Flask application: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
