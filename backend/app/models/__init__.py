"""Models package export for TravelBuddy."""
from .user import User, UserPreference
from .destination import Destination
from .trip import Trip, ItineraryDay, ItineraryActivity
from .favorite import Favorite
from .history import SearchHistory, DestinationViewHistory

__all__ = [
    'User',
    'UserPreference',
    'Destination',
    'Trip',
    'ItineraryDay',
    'ItineraryActivity',
    'Favorite',
    'SearchHistory',
    'DestinationViewHistory',
]
