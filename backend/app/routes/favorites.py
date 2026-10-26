"""Favorites bookmarking routes."""
from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models.favorite import Favorite
from ..models.destination import Destination
from ..utils.security import auth_required
from ..utils.errors import APIError

favorites_bp = Blueprint('favorites', __name__, url_prefix='/api/v1/favorites')

@favorites_bp.route('', methods=['GET'])
@auth_required
def list_favorites():
    """Returns all destinations favorited by the authenticated user."""
    favs = Favorite.query.filter_by(user_id=g.current_user_id).order_by(Favorite.created_at.desc()).all()
    return jsonify({
        'success': True,
        'data': {
            'favorites': [f.to_dict() for f in favs],
            'count': len(favs)
        }
    }), 200

@favorites_bp.route('', methods=['POST'])
@auth_required
def add_favorite():
    """Bookmarks a destination for the user."""
    data = request.get_json() or {}
    destination_id = data.get('destination_id')
    if not destination_id:
        raise APIError("destination_id is required.", status_code=400)

    dest = Destination.query.get(destination_id)
    if not dest:
        raise APIError("Destination not found.", status_code=404)

    existing = Favorite.query.filter_by(user_id=g.current_user_id, destination_id=destination_id).first()
    if existing:
        return jsonify({
            'success': True,
            'message': 'Destination already in favorites.',
            'data': {'favorite': existing.to_dict()}
        }), 200

    fav = Favorite(user_id=g.current_user_id, destination_id=destination_id)
    db.session.add(fav)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Destination saved to favorites.',
        'data': {'favorite': fav.to_dict()}
    }), 201

@favorites_bp.route('/<int:destination_id>', methods=['DELETE'])
@auth_required
def remove_favorite(destination_id: int):
    """Removes a destination from favorites."""
    fav = Favorite.query.filter_by(user_id=g.current_user_id, destination_id=destination_id).first()
    if not fav:
        raise APIError("Favorite not found.", status_code=404)

    db.session.delete(fav)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Destination removed from favorites.'
    }), 200
