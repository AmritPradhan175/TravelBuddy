"""User profile and travel preferences routes."""
from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models.user import User, UserPreference
from ..utils.security import auth_required
from ..utils.errors import APIError

profile_bp = Blueprint('profile', __name__, url_prefix='/api/v1/profile')

@profile_bp.route('', methods=['GET'])
@auth_required
def get_profile():
    """Returns the authenticated user's profile and preferences."""
    user = User.query.get(g.current_user_id)
    if not user:
        raise APIError("User not found.", status_code=404)

    return jsonify({
        'success': True,
        'data': {
            'user': user.to_dict()
        }
    }), 200

@profile_bp.route('', methods=['PATCH'])
@auth_required
def update_profile():
    """Updates the user's name, home city, or avatar."""
    user = User.query.get(g.current_user_id)
    if not user:
        raise APIError("User not found.", status_code=404)

    data = request.get_json() or {}
    if 'full_name' in data:
        user.full_name = data['full_name'].strip()
    if 'home_city' in data:
        user.home_city = data['home_city'].strip()
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url'].strip()

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully.',
        'data': {
            'user': user.to_dict()
        }
    }), 200

@profile_bp.route('/preferences', methods=['GET'])
@auth_required
def get_preferences():
    """Returns travel styles, budget tier, and preferred regions."""
    user = User.query.get(g.current_user_id)
    if not user:
        raise APIError("User not found.", status_code=404)

    return jsonify({
        'success': True,
        'data': {
            'preferences': user.preferences.to_dict() if user.preferences else {}
        }
    }), 200

@profile_bp.route('/preferences', methods=['PUT'])
@auth_required
def update_preferences():
    """Updates travel style preferences used by the recommendation engine."""
    user = User.query.get(g.current_user_id)
    if not user:
        raise APIError("User not found.", status_code=404)

    data = request.get_json() or {}
    pref = user.preferences
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.session.add(pref)

    if 'travel_styles' in data:
        pref.travel_styles = data['travel_styles']
    if 'preferred_regions' in data:
        pref.preferred_regions = data['preferred_regions']
    if 'default_budget_tier' in data:
        pref.default_budget_tier = data['default_budget_tier']
    if 'currency' in data:
        pref.currency = data['currency']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Preferences saved successfully.',
        'data': {
            'preferences': pref.to_dict()
        }
    }), 200
