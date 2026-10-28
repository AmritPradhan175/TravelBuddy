"""Recommendation endpoints powered by TF-IDF & Cosine Similarity."""
from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models.user import User
from ..models.favorite import Favorite
from ..services.recommender_service import recommender
from ..utils.security import optional_auth

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/v1/recommendations')

@recommendations_bp.route('', methods=['POST'])
@optional_auth
def get_recommendations():
    """Returns recommendations based on provided traveler criteria."""
    data = request.get_json() or {}
    travel_styles = data.get('travel_styles', [])
    preferred_regions = data.get('preferred_regions', [])
    budget_tier = data.get('budget_tier', 'mid_range')
    top_n = int(data.get('limit', 6))

    exclude_ids = []
    if g.current_user_id:
        favs = Favorite.query.filter_by(user_id=g.current_user_id).all()
        exclude_ids = [f.destination_id for f in favs]

    results = recommender.get_personalized_recommendations(
        travel_styles=travel_styles,
        preferred_regions=preferred_regions,
        budget_tier=budget_tier,
        exclude_ids=exclude_ids,
        top_n=top_n
    )

    return jsonify({
        'success': True,
        'data': {
            'recommendations': results,
            'count': len(results)
        }
    }), 200

@recommendations_bp.route('/personalized', methods=['GET'])
@optional_auth
def get_personalized():
    """Returns personalized recommendations based on the user's saved profile."""
    travel_styles = ['Nature', 'Cultural']
    preferred_regions = ['North India', 'South India']
    budget_tier = 'mid_range'
    exclude_ids = []

    if g.current_user_id:
        user = db.session.get(User, g.current_user_id)
        if user and user.preferences:
            travel_styles = user.preferences.travel_styles or travel_styles
            preferred_regions = user.preferences.preferred_regions or preferred_regions
            budget_tier = user.preferences.default_budget_tier or budget_tier

        favs = Favorite.query.filter_by(user_id=g.current_user_id).all()
        exclude_ids = [f.destination_id for f in favs]

    top_n = int(request.args.get('limit', 6))
    results = recommender.get_personalized_recommendations(
        travel_styles=travel_styles,
        preferred_regions=preferred_regions,
        budget_tier=budget_tier,
        exclude_ids=exclude_ids,
        top_n=top_n
    )

    return jsonify({
        'success': True,
        'data': {
            'recommendations': results,
            'count': len(results)
        }
    }), 200
