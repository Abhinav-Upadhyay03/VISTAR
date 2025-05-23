import sys
import time
from app import create_app

start = time.time()
print("Starting backend...")

app = create_app()
print(f"App created in {time.time() - start:.2f} seconds")

if __name__ == "__main__":
    # Only enable debug in development
    debug = not getattr(sys, 'frozen', False)
    port = 5000
    print(f"About to run app after {time.time() - start:.2f} seconds")
    app.run(debug=debug, port=port)
