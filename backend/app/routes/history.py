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
    searches = db.session.query(SearchHistory).filter_by(user_id=g.current_user_id).order_by(SearchHistory.created_at.desc()).limit(20).all()
    views = db.session.query(DestinationViewHistory).filter_by(user_id=g.current_user_id).order_by(DestinationViewHistory.viewed_at.desc()).limit(20).all()

    search_list = [s.to_dict() for s in searches]
    view_list = [v.to_dict() for v in views]

    return jsonify({
        'success': True,
        'data': {
            'history': search_list,
            'searches': search_list,
            'views': view_list
        }
    }), 200

@history_bp.route('/search', methods=['GET'])
@auth_required
def get_search_history():
    """Retrieves recent searches for the authenticated user."""
    searches = db.session.query(SearchHistory).filter_by(user_id=g.current_user_id).order_by(SearchHistory.created_at.desc()).limit(20).all()
    search_list = [s.to_dict() for s in searches]
    return jsonify({
        'success': True,
        'data': {
            'history': search_list,
            'searches': search_list,
            'count': len(search_list)
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

@history_bp.route('/search', methods=['DELETE'])
@auth_required
def clear_search_history():
    """Clears search history for the authenticated user."""
    db.session.query(SearchHistory).filter_by(user_id=g.current_user_id).delete()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Search history cleared successfully.'
    }), 200

@history_bp.route('/views', methods=['GET'])
@history_bp.route('/view', methods=['GET'])
@auth_required
def get_view_history():
    """Retrieves recently viewed destinations for the authenticated user."""
    views = db.session.query(DestinationViewHistory).filter_by(user_id=g.current_user_id).order_by(DestinationViewHistory.viewed_at.desc()).limit(20).all()
    view_list = [v.to_dict() for v in views]
    return jsonify({
        'success': True,
        'data': {
            'views': view_list,
            'count': len(view_list)
        }
    }), 200

@history_bp.route('/views', methods=['POST'])
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

@history_bp.route('/views', methods=['DELETE'])
@history_bp.route('/view', methods=['DELETE'])
@auth_required
def clear_view_history():
    """Clears viewed destinations history for the user."""
    db.session.query(DestinationViewHistory).filter_by(user_id=g.current_user_id).delete()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'View history cleared successfully.'
    }), 200

@history_bp.route('', methods=['DELETE'])
@auth_required
def clear_all_history():
    """Clears all search and viewing history for the user."""
    db.session.query(SearchHistory).filter_by(user_id=g.current_user_id).delete()
    db.session.query(DestinationViewHistory).filter_by(user_id=g.current_user_id).delete()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'All history cleared successfully.'
    }), 200
