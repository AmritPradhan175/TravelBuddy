"""Favorite SQLAlchemy model."""
import uuid
from datetime import datetime, timezone
from ..extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    destination_id = db.Column(db.Integer, db.ForeignKey('destinations.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'destination_id', name='uq_user_destination_favorite'),
    )

    # Relationships
    destination = db.relationship('Destination', backref='favorited_by')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'destination_id': self.destination_id,
            'destination': self.destination.to_dict() if self.destination else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
