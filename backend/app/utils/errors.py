"""Centralized error handling for TravelBuddy REST API."""
from flask import jsonify

class APIError(Exception):
    """Base API Exception for controlled error responses."""
    def __init__(self, message, status_code=400, details=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.details = details or {}

    def to_dict(self):
        rv = {
            'success': False,
            'error': {
                'message': self.message,
                'status_code': self.status_code,
            }
        }
        if self.details:
            rv['error']['details'] = self.details
        return rv

def register_error_handlers(app):
    """Registers global error handlers on Flask application."""

    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': {
                'message': 'Bad Request: The server could not understand the request.',
                'status_code': 400
            }
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': {
                'message': 'Unauthorized: Authentication is required to access this resource.',
                'status_code': 401
            }
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': {
                'message': 'Forbidden: You do not have permission to access this resource.',
                'status_code': 403
            }
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': {
                'message': 'Resource Not Found: The requested endpoint does not exist.',
                'status_code': 404
            }
        }), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            'success': False,
            'error': {
                'message': 'Internal Server Error: An unexpected error occurred on the server.',
                'status_code': 500
            }
        }), 500
