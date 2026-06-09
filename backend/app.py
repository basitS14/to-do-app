from flask import Flask, jsonify
from flask_cors import CORS
from flask_session import Session
from .config import config
from .models import db
from .auth_routes import auth_bp
from .todo_routes import todo_bp
import os

def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    # CORS(app, origins=app.config.get('CORS_ORIGINS', []), supports_credentials=True)
    Session(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(todo_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy', 'message': 'Todo API is running'}, 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500

    return app


