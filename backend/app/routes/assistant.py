"""Grounded AI Assistant routes."""
from flask import Blueprint, request, jsonify
from ..services.assistant_service import assistant_service
from ..utils.security import optional_auth
from ..utils.errors import APIError

assistant_bp = Blueprint('assistant', __name__, url_prefix='/api/v1/assistant')

@assistant_bp.route('/chat', methods=['POST'])
@optional_auth
def chat():
    """Handles conversational questions using the grounded tourism database."""
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    if not message:
        raise APIError("Message text is required.", status_code=400)

    result = assistant_service.process_message(message)

    return jsonify({
        'success': True,
        'data': result
    }), 200
