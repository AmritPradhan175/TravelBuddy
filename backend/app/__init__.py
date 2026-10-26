"""Flask Application Factory for TravelBuddy REST API."""
import os
from flask import Flask, jsonify
from .config import config_by_name
from .extensions import db, migrate, cors
from .routes import register_routes
from .utils.errors import register_error_handlers
from .services.recommender_service import recommender

def create_app(config_name=None):
    """Application factory for Flask app."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', '*')}},
        supports_credentials=True
    )

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints
    register_routes(app)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'TravelBuddy REST API',
            'version': '1.0.0',
            'database': app.config['SQLALCHEMY_DATABASE_URI'].split('://')[0]
        }), 200

    # Auto-initialize database tables and train recommender
    with app.app_context():
        try:
            db.create_all()
            from .models.destination import Destination
            destinations = Destination.query.all()
            if destinations:
                recommender.fit(destinations)
        except Exception as e:
            app.logger.warning(f"Initial DB check warning: {e}")

    return app
