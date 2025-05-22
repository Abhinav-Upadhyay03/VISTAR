import os
import sys
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Get the port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # In production, bind to localhost only
    host = '127.0.0.1'
    
    # Run the app
    app.run(host=host, port=port, debug=False)
