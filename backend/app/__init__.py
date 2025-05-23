from flask import Flask, jsonify
from flask_cors import CORS
import os
import logging

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    STATIC_FOLDER = os.path.join(BASE_DIR, 'static')
    UPLOAD_FOLDER = os.path.join(STATIC_FOLDER, 'temp_uploads')
    ASSETS_FOLDER = os.path.join(STATIC_FOLDER, 'assets')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

logs_dir = os.path.expanduser('~/Logs/Vistar')
os.makedirs(logs_dir, exist_ok=True)
log_file = os.path.join(logs_dir, 'backend.log')
logging.basicConfig(filename=log_file, level=logging.INFO)

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.errorhandler(Exception)
    def handle_exception(e):
        logging.exception("Exception in Flask app:")
        return jsonify({'error': str(e)}), 500

    # Load configurations
    app.config.from_object(Config)

    # Register blueprints or routes
    with app.app_context():
        from app.routes import api_bp
        app.register_blueprint(api_bp)

    return app
