import pandas as pd
import ast
import json
import re

df = pd.read_csv('data/india_tourism_dataset.csv', encoding='utf-8', encoding_errors='replace')

image_map = {
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
    'Kolkata': 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
    'Pondicherry (Puducherry)': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    'Gokarna': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    'Jim Corbett National Park': 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
    'Ranthambore National Park': 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    'Kaziranga National Park': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
}

category_photos = {
    'Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'Trekking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
    'Heritage': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'Cultural': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    'Wildlife': 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
    'Religious': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    'Spiritual': 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80',
    'Nature': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    'Desert': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    'Default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
}

def clean_text(text):
    if isinstance(text, str):
        # Clean weird character encodings
        text = text.replace('\ufffd', '-').replace('', '-')
    return text

def parse_val(val):
    if isinstance(val, str):
        val = clean_text(val).strip()
        if (val.startswith('{') and val.endswith('}')) or (val.startswith('[') and val.endswith(']')):
            try:
                parsed = ast.literal_eval(val)
                return sanitize_structure(parsed)
            except Exception:
                return val
    return clean_text(val)

def sanitize_structure(item):
    if isinstance(item, dict):
        return {k: sanitize_structure(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [sanitize_structure(x) for x in item]
    elif isinstance(item, str):
        return clean_text(item)
    return item

parsed_records = []
for idx, row in df.iterrows():
    record = {}
    for col in df.columns:
        record[col] = parse_val(row[col])
    
    name = record['destination_name']
    trip_types = record.get('trip_types', [])
    if isinstance(trip_types, str):
        trip_types = [trip_types]
    
    photo = None
    for k, v in image_map.items():
        if k.lower() in name.lower() or name.lower() in k.lower():
            photo = v
            break
            
    if not photo:
        for t in trip_types:
            for cat_key in category_photos:
                if cat_key.lower() in str(t).lower():
                    photo = category_photos[cat_key]
                    break
            if photo:
                break
    if not photo:
        photo = category_photos['Default']
    
    record['image_url'] = photo
    parsed_records.append(record)

# Save JSON file
with open('frontend/src/data/destinations.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_records, f, ensure_ascii=False, indent=2)

# Save TypeScript file with full types
ts_content = f"""// Auto-generated destination dataset from india_tourism_dataset.csv
// TravelBuddy Tourism Platform

export interface Coordinates {{
  latitude: number;
  longitude: number;
}}

export interface CostCategory {{
  accommodation_range: [number, number];
  food_range: [number, number];
  activities_range: [number, number];
  local_transport_range: [number, number];
  total_daily_range: [number, number];
}}

export interface TransportHub {{
  name: string;
  distance_km: number;
}}

export interface Destination {{
  id: number;
  destination_name: string;
  state: string;
  district: string;
  region: string;
  coordinates: Coordinates | any;
  altitude_m: number;
  popularity_score: number;
  accessibility: string;
  nearest_airport: TransportHub | any;
  nearest_railway_station: TransportHub | any;
  nearest_major_city: TransportHub | any;
  road_connectivity: string;
  budget_category: CostCategory | any;
  mid_range_category: CostCategory | any;
  luxury_category: CostCategory | any;
  trip_types: string[] | string;
  primary_attractions: string[] | string;
  activities_available: string[] | string;
  unique_experiences: string;
  hidden_gems: string[] | string;
  best_seasons: string[] | string;
  avoid_seasons: string[] | string;
  peak_tourist_season: string;
  off_season: string;
  average_temperature: Record<string, string> | string;
  rainfall_pattern: string;
  ideal_for: string[] | string;
  ideal_for_why: Record<string, string> | string;
  special_considerations: string;
  minimum_days: number;
  ideal_days: number;
  maximum_days: number;
  suggested_itinerary: string;
  accommodation_types: string[] | string;
  food_scene: string;
  safety_rating: number;
  safety_notes: string;
  internet_connectivity: string;
  mobile_network: string[] | string;
  atm_availability: string;
  language_spoken: string[] | string;
  permits_required: boolean;
  permits_details: string;
  local_culture: string;
  festivals_events: string;
  local_customs: string;
  shopping_highlights: string | string[];
  local_cuisine_must_try: string[] | string;
  last_updated: string;
  data_sources: string[] | string;
  user_reviews_summary: string;
  recent_developments: string;
  sustainability_notes: string;
  image_url: string;
}}

export const destinationsData: Destination[] = {json.dumps(parsed_records, ensure_ascii=False, indent=2)};
"""

with open('frontend/src/data/destinations.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Generated frontend/src/data/destinations.ts with {len(parsed_records)} destinations.")
