"""Destination SQLAlchemy model representing the Kaggle Indian Tourism Dataset."""
from datetime import datetime, timezone
from ..extensions import db

class Destination(db.Model):
    __tablename__ = 'destinations'

    id = db.Column(db.Integer, primary_key=True)
    destination_name = db.Column(db.String(150), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=False, index=True)
    district = db.Column(db.String(150), nullable=True)
    region = db.Column(db.String(50), nullable=False, index=True) # North India, South India, etc.
    
    # Geography & Logistics
    coordinates = db.Column(db.JSON, nullable=True) # {'latitude': float, 'longitude': float}
    altitude_m = db.Column(db.Integer, default=0)
    popularity_score = db.Column(db.Integer, default=5, index=True) # 1 - 10
    accessibility = db.Column(db.String(50), default='Easy')
    nearest_airport = db.Column(db.JSON, nullable=True)
    nearest_railway_station = db.Column(db.JSON, nullable=True)
    nearest_major_city = db.Column(db.JSON, nullable=True)
    road_connectivity = db.Column(db.String(100), default='Good')

    # Costs & Budget Categories in INR
    budget_category = db.Column(db.JSON, nullable=True)
    mid_range_category = db.Column(db.JSON, nullable=True)
    luxury_category = db.Column(db.JSON, nullable=True)

    # Tourism Attributes
    trip_types = db.Column(db.JSON, default=list) # ['Beach', 'Cultural', 'Adventure']
    primary_attractions = db.Column(db.JSON, default=list)
    activities_available = db.Column(db.JSON, default=list)
    unique_experiences = db.Column(db.Text, nullable=True)
    hidden_gems = db.Column(db.JSON, default=list)

    # Climate & Seasons
    best_seasons = db.Column(db.JSON, default=list)
    avoid_seasons = db.Column(db.JSON, default=list)
    peak_tourist_season = db.Column(db.String(100), nullable=True)
    off_season = db.Column(db.String(100), nullable=True)
    average_temperature = db.Column(db.JSON, nullable=True)
    rainfall_pattern = db.Column(db.String(255), nullable=True)

    # Traveler Fit & Itinerary
    ideal_for = db.Column(db.JSON, default=list)
    ideal_for_why = db.Column(db.JSON, nullable=True)
    special_considerations = db.Column(db.Text, nullable=True)
    minimum_days = db.Column(db.Float, default=2.0)
    ideal_days = db.Column(db.Float, default=4.0)
    maximum_days = db.Column(db.Integer, default=7)
    suggested_itinerary = db.Column(db.Text, nullable=True)
    accommodation_types = db.Column(db.JSON, default=list)
    food_scene = db.Column(db.Text, nullable=True)

    # Safety & Connectivity
    safety_rating = db.Column(db.Integer, default=8)
    safety_notes = db.Column(db.Text, nullable=True)
    internet_connectivity = db.Column(db.String(100), nullable=True)
    mobile_network = db.Column(db.JSON, default=list)
    atm_availability = db.Column(db.String(100), nullable=True)
    language_spoken = db.Column(db.JSON, default=list)

    # Permits & Culture
    permits_required = db.Column(db.Boolean, default=False)
    permits_details = db.Column(db.String(255), default='Not required')
    local_culture = db.Column(db.Text, nullable=True)
    festivals_events = db.Column(db.Text, nullable=True)
    local_customs = db.Column(db.Text, nullable=True)
    shopping_highlights = db.Column(db.JSON, nullable=True)
    local_cuisine_must_try = db.Column(db.JSON, default=list)

    # Reviews & Photography
    user_reviews_summary = db.Column(db.Text, nullable=True)
    recent_developments = db.Column(db.Text, nullable=True)
    sustainability_notes = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        """Serializes destination to JSON-compatible dictionary."""
        return {
            'id': self.id,
            'destination_name': self.destination_name,
            'state': self.state,
            'district': self.district,
            'region': self.region,
            'coordinates': self.coordinates,
            'altitude_m': self.altitude_m,
            'popularity_score': self.popularity_score,
            'accessibility': self.accessibility,
            'nearest_airport': self.nearest_airport,
            'nearest_railway_station': self.nearest_railway_station,
            'nearest_major_city': self.nearest_major_city,
            'road_connectivity': self.road_connectivity,
            'budget_category': self.budget_category,
            'mid_range_category': self.mid_range_category,
            'luxury_category': self.luxury_category,
            'trip_types': self.trip_types or [],
            'primary_attractions': self.primary_attractions or [],
            'activities_available': self.activities_available or [],
            'unique_experiences': self.unique_experiences,
            'hidden_gems': self.hidden_gems or [],
            'best_seasons': self.best_seasons or [],
            'avoid_seasons': self.avoid_seasons or [],
            'peak_tourist_season': self.peak_tourist_season,
            'off_season': self.off_season,
            'average_temperature': self.average_temperature,
            'rainfall_pattern': self.rainfall_pattern,
            'ideal_for': self.ideal_for or [],
            'ideal_for_why': self.ideal_for_why,
            'special_considerations': self.special_considerations,
            'minimum_days': self.minimum_days,
            'ideal_days': self.ideal_days,
            'maximum_days': self.maximum_days,
            'suggested_itinerary': self.suggested_itinerary,
            'accommodation_types': self.accommodation_types or [],
            'food_scene': self.food_scene,
            'safety_rating': self.safety_rating,
            'safety_notes': self.safety_notes,
            'internet_connectivity': self.internet_connectivity,
            'mobile_network': self.mobile_network or [],
            'atm_availability': self.atm_availability,
            'language_spoken': self.language_spoken or [],
            'permits_required': self.permits_required,
            'permits_details': self.permits_details,
            'local_culture': self.local_culture,
            'festivals_events': self.festivals_events,
            'local_customs': self.local_customs,
            'shopping_highlights': self.shopping_highlights,
            'local_cuisine_must_try': self.local_cuisine_must_try or [],
            'user_reviews_summary': self.user_reviews_summary,
            'recent_developments': self.recent_developments,
            'sustainability_notes': self.sustainability_notes,
            'image_url': self.image_url,
        }
