from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load configurations
    app.config.from_object('app.config.Config')

    # Register blueprints or routes
    with app.app_context():
        from app.routes import api_bp
        app.register_blueprint(api_bp)

    return app
