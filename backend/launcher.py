import sys
import os
import subprocess

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Change to the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Import and run the Flask app
try:
    from run import main
    main()
except Exception as e:
    print(f"Error starting Flask app: {e}")
    input("Press Enter to exit...")
