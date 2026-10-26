"""User and UserPreference SQLAlchemy models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB
from ..extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    avatar_url = db.Column(db.String(512), nullable=True)
    home_city = db.Column(db.String(100), default='Bengaluru')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    preferences = db.relationship('UserPreference', backref='user', uselist=False, cascade='all, delete-orphan')
    trips = db.relationship('Trip', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    searches = db.relationship('SearchHistory', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    views = db.relationship('DestinationViewHistory', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'avatar_url': self.avatar_url,
            'home_city': self.home_city,
            'preferences': self.preferences.to_dict() if self.preferences else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class UserPreference(db.Model):
    __tablename__ = 'user_preferences'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    travel_styles = db.Column(db.JSON, default=list) # e.g. ['Nature', 'Cultural', 'Adventure']
    preferred_regions = db.Column(db.JSON, default=list)
    default_budget_tier = db.Column(db.String(20), default='mid_range') # budget, mid_range, luxury
    currency = db.Column(db.String(10), default='INR')
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'travel_styles': self.travel_styles or [],
            'preferred_regions': self.preferred_regions or [],
            'default_budget_tier': self.default_budget_tier or 'mid_range',
            'currency': self.currency or 'INR',
        }
