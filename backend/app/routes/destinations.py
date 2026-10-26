"""Destination catalog and discovery routes."""
from flask import Blueprint, request, jsonify
from ..models.destination import Destination
from ..services.recommender_service import recommender
from ..utils.errors import APIError

destinations_bp = Blueprint('destinations', __name__, url_prefix='/api/v1/destinations')

@destinations_bp.route('', methods=['GET'])
def list_destinations():
    """Lists and filters destinations with search, category, region, and pagination."""
    query_str = request.args.get('search', '').strip().lower()
    category = request.args.get('category', '').strip()
    region = request.args.get('region', '').strip()
    sort_by = request.args.get('sort', 'popularity')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 100))

    query = Destination.query

    # Apply search filter
    if query_str:
        query = query.filter(
            (Destination.destination_name.ilike(f'%{query_str}%')) |
            (Destination.state.ilike(f'%{query_str}%')) |
            (Destination.district.ilike(f'%{query_str}%')) |
            (Destination.unique_experiences.ilike(f'%{query_str}%'))
        )

    # Apply region filter
    if region and region.lower() != 'all':
        query = query.filter(Destination.region.ilike(f'%{region}%'))

    # Sorting
    if sort_by == 'name':
        query = query.order_by(Destination.destination_name.asc())
    elif sort_by == 'duration':
        query = query.order_by(Destination.ideal_days.desc())
    else: # popularity default
        query = query.order_by(Destination.popularity_score.desc())

    total_count = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    # In-memory category filter if requested
    if category and category.lower() != 'all':
        filtered = []
        for d in items:
            types = str(d.trip_types).lower()
            if category.lower() in types:
                filtered.append(d)
        items = filtered
        total_count = len(filtered)

    return jsonify({
        'success': True,
        'data': {
            'destinations': [d.to_dict() for d in items],
            'pagination': {
                'total': total_count,
                'page': page,
                'limit': limit,
                'total_pages': max(1, (total_count + limit - 1) // limit)
            }
        }
    }), 200

@destinations_bp.route('/<int:destination_id>', methods=['GET'])
def get_destination(destination_id: int):
    """Retrieves full details for a single destination."""
    dest = Destination.query.get(destination_id)
    if not dest:
        raise APIError("Destination not found.", status_code=404)

    return jsonify({
        'success': True,
        'data': {
            'destination': dest.to_dict()
        }
    }), 200

@destinations_bp.route('/<int:destination_id>/similar', methods=['GET'])
def get_similar(destination_id: int):
    """Calculates similar destinations using the TF-IDF machine learning model."""
    dest = Destination.query.get(destination_id)
    if not dest:
        raise APIError("Destination not found.", status_code=404)

    top_n = int(request.args.get('limit', 4))
    similar = recommender.get_similar_destinations(destination_id, top_n=top_n)

    return jsonify({
        'success': True,
        'data': {
            'destination_id': destination_id,
            'similar_destinations': similar
        }
    }), 200
