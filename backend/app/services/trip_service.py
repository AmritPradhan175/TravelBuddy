"""Trip and Itinerary planning service."""
from ..extensions import db
from ..models.trip import Trip, ItineraryDay, ItineraryActivity
from ..models.destination import Destination
from ..utils.errors import APIError

class TripService:
    @staticmethod
    def generate_itinerary(
        destination: Destination,
        duration_days: int = 4,
        budget_tier: str = 'mid_range',
        traveler_count: int = 2,
        travel_style: str = 'Relaxation'
    ) -> dict:
        """Generates a structured day-by-day itinerary with verifiable sights and costs."""
        attractions = destination.primary_attractions if isinstance(destination.primary_attractions, list) else ['Historic Landmarks', 'Scenic Viewpoint']
        activities = destination.activities_available if isinstance(destination.activities_available, list) else ['Sightseeing', 'Cultural Walking Tour']
        
        # Calculate daily budget tier
        tier_data = destination.mid_range_category if budget_tier == 'mid_range' else (destination.luxury_category if budget_tier == 'luxury' else destination.budget_category)
        daily_cost = 3000.0
        if isinstance(tier_data, dict) and 'total_daily_range' in tier_data:
            daily_cost = float(tier_data['total_daily_range'][0])

        days = []
        for i in range(1, duration_days + 1):
            day_theme = "Arrival & City Orientation" if i == 1 else ("Farewell, Leisure & Departure" if i == duration_days else "Core Heritage & Nature Sights")
            morning_sight = attractions[(i * 2 - 2) % len(attractions)] if attractions else "Scenic Walk"
            afternoon_sight = attractions[(i * 2 - 1) % len(attractions)] if len(attractions) > 1 else "Local Markets"
            evening_act = activities[(i - 1) % len(activities)] if activities else "Sunset & Dinner"

            activities_list = [
                {
                    'time_slot': 'Morning',
                    'title': f"Morning Exploration: {morning_sight}",
                    'description': f"Early morning visit to {morning_sight} to enjoy optimal weather, quiet surroundings, and great photography.",
                    'estimated_cost_inr': round(daily_cost * 0.35, 0),
                    'location_name': morning_sight
                },
                {
                    'time_slot': 'Afternoon',
                    'title': f"Afternoon Discovery: {afternoon_sight}",
                    'description': f"Guided tour through {afternoon_sight}, followed by authentic regional lunch.",
                    'estimated_cost_inr': round(daily_cost * 0.40, 0),
                    'location_name': afternoon_sight
                },
                {
                    'time_slot': 'Evening',
                    'title': f"Evening Relaxation: {evening_act}",
                    'description': f"Wind down the day with {evening_act} and local dining.",
                    'estimated_cost_inr': round(daily_cost * 0.25, 0),
                    'location_name': destination.destination_name
                }
            ]

            days.append({
                'day_number': i,
                'theme': f"Day {i}: {day_theme}",
                'day_notes': f"Recommended pace: Moderate. Keep transit routes in mind for {morning_sight} and {afternoon_sight}.",
                'activities': activities_list
            })

        total_estimated = round(daily_cost * duration_days * traveler_count, 2)
        return {
            'destination_id': destination.id,
            'destination_name': destination.destination_name,
            'state': destination.state,
            'image_url': destination.image_url,
            'duration_days': duration_days,
            'traveler_count': traveler_count,
            'travel_style': travel_style,
            'budget_tier': budget_tier,
            'total_estimated_cost_inr': total_estimated,
            'daily_cost_per_person_inr': daily_cost,
            'days': days
        }

    @staticmethod
    def create_trip(user_id: str, data: dict) -> Trip:
        """Saves a trip and its itinerary days into the database."""
        dest_name = data.get('destination_name')
        destination = Destination.query.filter_by(destination_name=dest_name).first()

        trip = Trip(
            user_id=user_id,
            destination_id=destination.id if destination else data.get('destination_id'),
            destination_name=dest_name or "Custom Journey",
            state=destination.state if destination else data.get('state'),
            title=data.get('title') or f"Trip to {dest_name}",
            image_url=data.get('image_url') or (destination.image_url if destination else None),
            duration_days=int(data.get('duration_days', 4)),
            traveler_count=int(data.get('traveler_count', 2)),
            travel_style=data.get('travel_style', 'Relaxation'),
            budget_tier=data.get('budget_tier', 'mid_range'),
            total_budget_inr=float(data.get('total_budget_inr', 0.0)),
            estimated_cost_inr=float(data.get('estimated_cost_inr', 0.0)),
        )
        db.session.add(trip)
        db.session.flush()

        # Add days and activities if provided
        days_data = data.get('days', [])
        for d in days_data:
            day = ItineraryDay(
                trip_id=trip.id,
                day_number=d.get('day_number', 1),
                theme=d.get('theme', f"Day {d.get('day_number')}"),
                day_notes=d.get('day_notes', '')
            )
            db.session.add(day)
            db.session.flush()

            for act in d.get('activities', []):
                activity = ItineraryActivity(
                    day_id=day.id,
                    time_slot=act.get('time_slot', 'Morning'),
                    title=act.get('title', 'Activity'),
                    description=act.get('description', ''),
                    estimated_cost_inr=float(act.get('estimated_cost_inr', 0.0)),
                    location_name=act.get('location_name', '')
                )
                db.session.add(activity)

        db.session.commit()
        return trip

trip_service = TripService()
