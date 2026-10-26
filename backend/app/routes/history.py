"""Search and browsing history routes."""
from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models.history import SearchHistory, DestinationViewHistory
from ..utils.security import auth_required
from ..utils.errors import APIError

history_bp = Blueprint('history', __name__, url_prefix='/api/v1/history')

@history_bp.route('', methods=['GET'])
@auth_required
def get_user_history():
    """Retrieves recent searches and viewed destinations for the authenticated user."""
    searches = SearchHistory.query.filter_by(user_id=g.current_user_id).order_by(SearchHistory.created_at.desc()).limit(20).all()
    views = DestinationViewHistory.query.filter_by(user_id=g.current_user_id).order_by(DestinationViewHistory.viewed_at.desc()).limit(20).all()

    return jsonify({
        'success': True,
        'data': {
            'searches': [s.to_dict() for s in searches],
            'views': [v.to_dict() for v in views]
        }
    }), 200

@history_bp.route('/search', methods=['POST'])
@auth_required
def record_search():
    """Records a search query event."""
    data = request.get_json() or {}
    query = data.get('query', '').strip()
    if not query:
        raise APIError("Query string is required.", status_code=400)

    record = SearchHistory(user_id=g.current_user_id, query=query)
    db.session.add(record)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': record.to_dict()
    }), 201

@history_bp.route('/view', methods=['POST'])
@auth_required
def record_view():
    """Records a destination page visit event."""
    data = request.get_json() or {}
    dest_id = data.get('destination_id')
    if not dest_id:
        raise APIError("destination_id is required.", status_code=400)

    record = DestinationViewHistory(user_id=g.current_user_id, destination_id=dest_id)
    db.session.add(record)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': record.to_dict()
    }), 201

@history_bp.route('', methods=['DELETE'])
@auth_required
def clear_all_history():
    """Clears all search and viewing history for the user."""
    SearchHistory.query.filter_by(user_id=g.current_user_id).delete()
    DestinationViewHistory.query.filter_by(user_id=g.current_user_id).delete()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'All history cleared successfully.'
    }), 200
