"""Registers all Flask blueprints on the application."""
from .auth import auth_bp
from .destinations import destinations_bp
from .recommendations import recommendations_bp
from .trips import trips_bp
from .favorites import favorites_bp
from .history import history_bp
from .assistant import assistant_bp
from .profile import profile_bp

def register_routes(app):
    """Registers versioned /api/v1 blueprints."""
    app.register_blueprint(auth_bp)
    app.register_blueprint(destinations_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(assistant_bp)
    app.register_blueprint(profile_bp)
