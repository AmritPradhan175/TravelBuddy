"""Trip, ItineraryDay, and ItineraryActivity SQLAlchemy models."""
import uuid
from datetime import datetime, timezone
from ..extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class Trip(db.Model):
    __tablename__ = 'trips'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    destination_id = db.Column(db.Integer, db.ForeignKey('destinations.id', ondelete='SET NULL'), nullable=True)
    destination_name = db.Column(db.String(150), nullable=False)
    state = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(512), nullable=True)

    # Trip configuration
    start_date = db.Column(db.String(50), nullable=True)
    end_date = db.Column(db.String(50), nullable=True)
    duration_days = db.Column(db.Integer, default=5, nullable=False)
    traveler_count = db.Column(db.Integer, default=2, nullable=False)
    travel_style = db.Column(db.String(50), default='Relaxation')
    budget_tier = db.Column(db.String(20), default='mid_range') # budget, mid_range, luxury
    currency = db.Column(db.String(10), default='INR')
    total_budget_inr = db.Column(db.Float, default=0.0)
    estimated_cost_inr = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    days = db.relationship('ItineraryDay', backref='trip', cascade='all, delete-orphan', order_by='ItineraryDay.day_number')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'destination_id': self.destination_id,
            'destination_name': self.destination_name,
            'state': self.state,
            'title': self.title,
            'image_url': self.image_url,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'duration_days': self.duration_days,
            'traveler_count': self.traveler_count,
            'travel_style': self.travel_style,
            'budget_tier': self.budget_tier,
            'currency': self.currency,
            'total_budget_inr': self.total_budget_inr,
            'estimated_cost_inr': self.estimated_cost_inr,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'days': [day.to_dict() for day in self.days],
        }

class ItineraryDay(db.Model):
    __tablename__ = 'itinerary_days'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    trip_id = db.Column(db.String(36), db.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False, index=True)
    day_number = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(50), nullable=True)
    theme = db.Column(db.String(200), nullable=False)
    day_notes = db.Column(db.Text, nullable=True)

    # Relationships
    activities = db.relationship('ItineraryActivity', backref='day', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'day_number': self.day_number,
            'date': self.date,
            'theme': self.theme,
            'day_notes': self.day_notes,
            'activities': [act.to_dict() for act in self.activities],
        }

class ItineraryActivity(db.Model):
    __tablename__ = 'itinerary_activities'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    day_id = db.Column(db.String(36), db.ForeignKey('itinerary_days.id', ondelete='CASCADE'), nullable=False, index=True)
    time_slot = db.Column(db.String(50), default='Morning') # Morning, Afternoon, Evening
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    estimated_cost_inr = db.Column(db.Float, default=0.0)
    location_name = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'time_slot': self.time_slot,
            'title': self.title,
            'description': self.description,
            'estimated_cost_inr': self.estimated_cost_inr,
            'location_name': self.location_name,
        }
