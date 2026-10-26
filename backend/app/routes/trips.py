"""Trip planning and itinerary CRUD routes."""
from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models.trip import Trip, ItineraryDay, ItineraryActivity
from ..models.destination import Destination
from ..services.trip_service import trip_service
from ..utils.security import auth_required, optional_auth
from ..utils.errors import APIError

trips_bp = Blueprint('trips', __name__, url_prefix='/api/v1/trips')

@trips_bp.route('/generate', methods=['POST'])
def generate_itinerary_preview():
    """Generates an ephemeral structured itinerary without saving it to database."""
    data = request.get_json() or {}
    dest_name = data.get('destination_name')
    dest_id = data.get('destination_id')

    destination = None
    if dest_id:
        destination = Destination.query.get(dest_id)
    elif dest_name:
        destination = Destination.query.filter(Destination.destination_name.ilike(f"%{dest_name}%")).first()

    if not destination:
        destination = Destination.query.first()

    itinerary = trip_service.generate_itinerary(
        destination=destination,
        duration_days=int(data.get('duration_days', 4)),
        budget_tier=data.get('budget_tier', 'mid_range'),
        traveler_count=int(data.get('traveler_count', 2)),
        travel_style=data.get('travel_style', 'Relaxation')
    )

    return jsonify({
        'success': True,
        'data': itinerary
    }), 200

@trips_bp.route('', methods=['GET'])
@auth_required
def list_user_trips():
    """Retrieves all trips belonging to the authenticated user."""
    trips = Trip.query.filter_by(user_id=g.current_user_id).order_by(Trip.created_at.desc()).all()
    return jsonify({
        'success': True,
        'data': {
            'trips': [t.to_dict() for t in trips],
            'count': len(trips)
        }
    }), 200

@trips_bp.route('', methods=['POST'])
@auth_required
def create_trip():
    """Creates and persists a new trip in the database."""
    data = request.get_json() or {}
    trip = trip_service.create_trip(user_id=g.current_user_id, data=data)

    return jsonify({
        'success': True,
        'message': 'Trip saved successfully.',
        'data': {
            'trip': trip.to_dict()
        }
    }), 201

@trips_bp.route('/<string:trip_id>', methods=['GET'])
@auth_required
def get_trip(trip_id: str):
    """Retrieves a specific trip with ownership authorization."""
    trip = Trip.query.filter_by(id=trip_id, user_id=g.current_user_id).first()
    if not trip:
        raise APIError("Trip not found or unauthorized.", status_code=404)

    return jsonify({
        'success': True,
        'data': {
            'trip': trip.to_dict()
        }
    }), 200

@trips_bp.route('/<string:trip_id>', methods=['PATCH'])
@auth_required
def update_trip(trip_id: str):
    """Updates trip details with ownership authorization."""
    trip = Trip.query.filter_by(id=trip_id, user_id=g.current_user_id).first()
    if not trip:
        raise APIError("Trip not found or unauthorized.", status_code=404)

    data = request.get_json() or {}
    if 'title' in data:
        trip.title = data['title']
    if 'traveler_count' in data:
        trip.traveler_count = int(data['traveler_count'])
    if 'budget_tier' in data:
        trip.budget_tier = data['budget_tier']
    if 'total_budget_inr' in data:
        trip.total_budget_inr = float(data['total_budget_inr'])

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Trip updated successfully.',
        'data': {
            'trip': trip.to_dict()
        }
    }), 200

@trips_bp.route('/<string:trip_id>', methods=['DELETE'])
@auth_required
def delete_trip(trip_id: str):
    """Deletes a trip belonging to the user."""
    trip = Trip.query.filter_by(id=trip_id, user_id=g.current_user_id).first()
    if not trip:
        raise APIError("Trip not found or unauthorized.", status_code=404)

    db.session.delete(trip)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Trip deleted successfully.'
    }), 200
