"""Seeds the database with all 100 destinations from india_tourism_dataset.csv."""
import ast
import pandas as pd
from pathlib import Path
from app import create_app
from app.extensions import db
from app.models.destination import Destination
from app.models.user import User, UserPreference
from app.utils.security import hash_password
from app.services.recommender_service import recommender

# Curated high-res imagery mapping
IMAGE_MAP = {
    'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    'Ladakh (Leh)': 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    'Jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    'Varanasi (Kashi)': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    'Agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    'Udaipur': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    'Kerala Backwaters (Alappuzha & Kumarakom)': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    'Coorg (Kodagu)': 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Ziro Valley': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Mawlynnong & nearby (including Living Root Bridges region)': 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200&q=80',
    'Shimla': 'https://images.unsplash.com/photo-1574950578143-858c6fc58922?auto=format&fit=crop&w=1200&q=80',
    'Dharamshala & McLeod Ganj': 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
    'Manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    'Tawang': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    'Khajjiar': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Spiti Valley': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Nubra Valley': 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80',
    'Pangong Lake (Pangong Tso)': 'https://images.unsplash.com/photo-1579618218290-24a26f63a708?auto=format&fit=crop&w=1200&q=80',
    'Ooty (Udhagamandalam)': 'https://images.unsplash.com/photo-1599818814571-08fa5ef14cfb?auto=format&fit=crop&w=1200&q=80',
    'Munnar': 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Rishikesh': 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80',
    'Hampi': 'https://images.unsplash.com/photo-1600100397608-f010f4438317?auto=format&fit=crop&w=1200&q=80',
    'Jaisalmer': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    'Amritsar': 'https://images.unsplash.com/photo-1588096344356-9b578c7c1dfb?auto=format&fit=crop&w=1200&q=80',
    'Andaman': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    'Darjeeling': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
}

CATEGORY_PHOTOS = {
    'Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'Trekking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
    'Heritage': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'Cultural': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    'Wildlife': 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
    'Religious': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    'Spiritual': 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80',
    'Default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
}

def clean_val(val):
    if isinstance(val, str):
        val = val.strip()
        if (val.startswith('{') and val.endswith('}')) or (val.startswith('[') and val.endswith(']')):
            try:
                return ast.literal_eval(val)
            except Exception:
                return val
    return val

def seed_database():
    app = create_app('development')
    with app.app_context():
        print("Initializing database tables...")
        db.create_all()

        csv_path = Path(__file__).resolve().parent.parent / 'data' / 'india_tourism_dataset.csv'
        if not csv_path.exists():
            print(f"Error: Dataset not found at {csv_path}")
            return

        df = pd.read_csv(csv_path, encoding='utf-8', encoding_errors='replace')
        print(f"Read {len(df)} rows from {csv_path.name}")

        existing_count = Destination.query.count()
        if existing_count >= len(df):
            print(f"Destinations already seeded ({existing_count} records exist).")
        else:
            print("Importing destinations into database...")
            added_count = 0
            for _, row in df.iterrows():
                dest_id = int(row['id'])
                if db.session.get(Destination, dest_id):
                    continue

                name = clean_val(row['destination_name'])
                trip_types = clean_val(row['trip_types'])
                if isinstance(trip_types, str):
                    trip_types = [trip_types]

                # Match photo
                photo = None
                for k, v in IMAGE_MAP.items():
                    if k.lower() in name.lower() or name.lower() in k.lower():
                        photo = v
                        break
                if not photo:
                    for t in trip_types:
                        for cat_k, cat_v in CATEGORY_PHOTOS.items():
                            if cat_k.lower() in str(t).lower():
                                photo = cat_v
                                break
                        if photo:
                            break
                if not photo:
                    photo = CATEGORY_PHOTOS['Default']

                dest = Destination(
                    id=dest_id,
                    destination_name=name,
                    state=clean_val(row['state']),
                    district=clean_val(row['district']),
                    region=clean_val(row['region']),
                    coordinates=clean_val(row['coordinates']),
                    altitude_m=int(row['altitude_m']) if not pd.isna(row['altitude_m']) else 0,
                    popularity_score=int(row['popularity_score']) if not pd.isna(row['popularity_score']) else 5,
                    accessibility=clean_val(row['accessibility']),
                    nearest_airport=clean_val(row['nearest_airport']),
                    nearest_railway_station=clean_val(row['nearest_railway_station']),
                    nearest_major_city=clean_val(row['nearest_major_city']),
                    road_connectivity=clean_val(row['road_connectivity']),
                    budget_category=clean_val(row['budget_category']),
                    mid_range_category=clean_val(row['mid_range_category']),
                    luxury_category=clean_val(row['luxury_category']),
                    trip_types=trip_types,
                    primary_attractions=clean_val(row['primary_attractions']),
                    activities_available=clean_val(row['activities_available']),
                    unique_experiences=clean_val(row['unique_experiences']),
                    hidden_gems=clean_val(row['hidden_gems']),
                    best_seasons=clean_val(row['best_seasons']),
                    avoid_seasons=clean_val(row['avoid_seasons']),
                    peak_tourist_season=clean_val(row['peak_tourist_season']),
                    off_season=clean_val(row['off_season']),
                    average_temperature=clean_val(row['average_temperature']),
                    rainfall_pattern=clean_val(row['rainfall_pattern']),
                    ideal_for=clean_val(row['ideal_for']),
                    ideal_for_why=clean_val(row['ideal_for_why']),
                    special_considerations=clean_val(row['special_considerations']),
                    minimum_days=float(row['minimum_days']) if not pd.isna(row['minimum_days']) else 2.0,
                    ideal_days=float(row['ideal_days']) if not pd.isna(row['ideal_days']) else 4.0,
                    maximum_days=int(row['maximum_days']) if not pd.isna(row['maximum_days']) else 7,
                    suggested_itinerary=clean_val(row['suggested_itinerary']),
                    accommodation_types=clean_val(row['accommodation_types']),
                    food_scene=clean_val(row['food_scene']),
                    safety_rating=int(row['safety_rating']) if not pd.isna(row['safety_rating']) else 8,
                    safety_notes=clean_val(row['safety_notes']),
                    internet_connectivity=clean_val(row['internet_connectivity']),
                    mobile_network=clean_val(row['mobile_network']),
                    atm_availability=clean_val(row['atm_availability']),
                    language_spoken=clean_val(row['language_spoken']),
                    permits_required=bool(row['permits_required']) if not pd.isna(row['permits_required']) else False,
                    permits_details=clean_val(row['permits_details']),
                    local_culture=clean_val(row['local_culture']),
                    festivals_events=clean_val(row['festivals_events']),
                    local_customs=clean_val(row['local_customs']),
                    shopping_highlights=clean_val(row['shopping_highlights']),
                    local_cuisine_must_try=clean_val(row['local_cuisine_must_try']),
                    user_reviews_summary=clean_val(row['user_reviews_summary']),
                    recent_developments=clean_val(row['recent_developments']),
                    sustainability_notes=clean_val(row['sustainability_notes']),
                    image_url=photo
                )
                db.session.add(dest)
                added_count += 1

            db.session.commit()
            print(f"Successfully seeded {added_count} destinations.")

        # Create demo user if not existing
        demo_email = 'explorer@travelbuddy.ai'
        if not User.query.filter_by(email=demo_email).first():
            print("Creating default demo user account...")
            user = User(
                email=demo_email,
                password_hash=hash_password('password123'),
                full_name='Amrit Pradhan',
                home_city='Bengaluru',
                avatar_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            )
            db.session.add(user)
            db.session.flush()

            pref = UserPreference(
                user_id=user.id,
                travel_styles=['Nature', 'Cultural', 'Adventure'],
                preferred_regions=['North India', 'South India'],
                default_budget_tier='mid_range',
                currency='INR'
            )
            db.session.add(pref)
            db.session.commit()
            print("Demo user created (Email: explorer@travelbuddy.ai / Password: password123)")

        # Fit recommender
        all_dests = Destination.query.all()
        if all_dests:
            recommender.fit(all_dests)
            print("TF-IDF Machine Learning model fitted successfully.")

if __name__ == '__main__':
    seed_database()
