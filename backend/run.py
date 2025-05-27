import sys
import time
import socket
from app import create_app
from windows_hook import _setup_windows_paths  # Import Windows hook

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

start = time.time()
print("Starting backend...")

# Setup Windows-specific configurations
_setup_windows_paths()

app = create_app()
print(f"App created in {time.time() - start:.2f} seconds")

if __name__ == "__main__":
    # Only enable debug in development
    debug = not getattr(sys, 'frozen', False)
    port = find_available_port()
    print(f"Using port: {port}")
    print(f"About to run app after {time.time() - start:.2f} seconds")
    app.run(debug=debug, port=port, host='127.0.0.1')  # Explicitly set host to localhost
