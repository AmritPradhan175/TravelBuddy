"""SearchHistory and DestinationViewHistory SQLAlchemy models."""
import uuid
from datetime import datetime, timezone
from ..extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class SearchHistory(db.Model):
    __tablename__ = 'search_histories'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    query = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'query': self.query,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class DestinationViewHistory(db.Model):
    __tablename__ = 'destination_views'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    destination_id = db.Column(db.Integer, db.ForeignKey('destinations.id', ondelete='CASCADE'), nullable=False, index=True)
    viewed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationship
    destination = db.relationship('Destination', backref='view_records')

    def to_dict(self):
        return {
            'id': self.id,
            'destination_id': self.destination_id,
            'destination_name': self.destination.destination_name if self.destination else None,
            'destination': self.destination.to_dict() if self.destination else None,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None,
        }
