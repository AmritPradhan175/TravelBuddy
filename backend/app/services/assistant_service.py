"""Grounded AI Travel Assistant Service querying the 100 Indian destination database.
Provides rich conversational answers, day-by-day itineraries, exact INR budgets,
packing advice, transit logistics, seasonal weather, and local culinary guides.
Supports optional Gemini API expansion when GEMINI_API_KEY is configured.
"""
import os
import re
import json
import urllib.request
import urllib.error
from ..models.destination import Destination
from .recommender_service import recommender

def clean_text(text: str) -> str:
    """Removes web scraping artifacts such as [web:123] and normalizes whitespace."""
    if not text:
        return ""
    cleaned = re.sub(r'\[web:\d+\]', '', str(text))
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

# Common aliases and nicknames for Indian tourist destinations
DESTINATION_ALIASES = {
    'kashi': 'Varanasi',
    'banaras': 'Varanasi',
    'benares': 'Varanasi',
    'bombay': 'Mumbai',
    'calcutta': 'Kolkata',
    'bangalore': 'Bengaluru',
    'bengaluru': 'Bangalore (Bengaluru)',
    'madras': 'Chennai',
    'chennai': 'Chennai',
    'pondicherry': 'Pondicherry',
    'pondy': 'Pondicherry',
    'puducherry': 'Pondicherry',
    'trivandrum': 'Thiruvananthapuram',
    'cochin': 'Kochi',
    'cochi': 'Kochi',
    'calicut': 'Kozhikode',
    'baroda': 'Vadodara',
    'ooty': 'Ooty (Udhagamandalam)',
    'udhagamandalam': 'Ooty (Udhagamandalam)',
    'shimla': 'Shimla',
    'simla': 'Shimla',
    'munnar': 'Munnar',
    'darjeeling': 'Darjeeling',
    'leh': 'Ladakh (Leh)',
    'ladakh': 'Ladakh (Leh)',
    'ladakh leh': 'Ladakh (Leh)',
    'rishikesh': 'Rishikesh & Haridwar (Himalayan Yoga Route)',
    'haridwar': 'Rishikesh & Haridwar (Himalayan Yoga Route)',
    'spiti': 'Spiti Valley',
    'spiti valley': 'Spiti Valley',
    'dharamshala': 'Dharamshala & McLeod Ganj',
    'dharamsala': 'Dharamshala & McLeod Ganj',
    'mcleodganj': 'Dharamshala & McLeod Ganj',
    'mcleod ganj': 'Dharamshala & McLeod Ganj',
    'andaman': 'Andaman Islands (Havelock & Neil)',
    'andamans': 'Andaman Islands (Havelock & Neil)',
    'havelock': 'Andaman Islands (Havelock & Neil)',
    'neil island': 'Andaman Islands (Havelock & Neil)',
    'kaziranga': 'Kaziranga National Park',
    'hampi': 'Hampi',
    'khajuraho': 'Khajuraho',
    'alleppey': 'Alleppey (Alappuzha)',
    'alappuzha': 'Alleppey (Alappuzha)',
    'kasol': 'Kasol & Parvati Valley',
    'parvati valley': 'Kasol & Parvati Valley',
    'manali': 'Manali',
    'goa': 'Goa',
    'jaipur': 'Jaipur',
    'pink city': 'Jaipur',
    'agra': 'Agra',
    'taj mahal': 'Agra',
    'udaipur': 'Udaipur',
    'city of lakes': 'Udaipur',
    'jaisalmer': 'Jaisalmer',
    'golden city': 'Jaisalmer',
    'jodhpur': 'Jodhpur',
    'blue city': 'Jodhpur',
    'mysore': 'Mysore (Mysuru)',
    'mysuru': 'Mysore (Mysuru)',
    'gangtok': 'Gangtok',
    'shillong': 'Shillong',
    'cherrapunji': 'Cherrapunji (Sohra)',
    'sohra': 'Cherrapunji (Sohra)',
    'kutch': 'Rann of Kutch',
    'rann of kutch': 'Rann of Kutch',
    'white desert': 'Rann of Kutch',
    'corbett': 'Jim Corbett National Park',
    'jim corbett': 'Jim Corbett National Park',
    'sundarbans': 'Sundarbans',
    'sunderbans': 'Sundarbans',
    'coorg': 'Coorg (Kodagu)',
    'kodagu': 'Coorg (Kodagu)',
    'wayanad': 'Wayanad',
    'varkala': 'Varkala',
    'gokarna': 'Gokarna',
    'chikmagalur': 'Chikmagalur',
    'chikkamagaluru': 'Chikmagalur',
    'pushkar': 'Pushkar',
    'amritsar': 'Amritsar',
    'golden temple': 'Amritsar',
    'mahabalipuram': 'Mahabalipuram',
    'mamallapuram': 'Mahabalipuram',
    'madurai': 'Madurai',
    'rameshwaram': 'Rameshwaram',
    'kanyakumari': 'Kanyakumari',
    'tirupati': 'Tirupati',
    'ajanta': 'Ajanta & Ellora Caves',
    'ellora': 'Ajanta & Ellora Caves',
    'badami': 'Badami',
    'pattadakal': 'Pattadakal',
    'mount abu': 'Mount Abu',
    'pachmarhi': 'Pachmarhi',
    'gulmarg': 'Gulmarg',
    'pahalgam': 'Pahalgam',
    'srinagar': 'Srinagar',
}

class AssistantService:
    def __init__(self):
        self._all_destinations_cache = None

    def _get_destinations(self):
        if not self._all_destinations_cache:
            self._all_destinations_cache = Destination.query.all()
        return self._all_destinations_cache

    def _find_matching_destination(self, query: str):
        """Fuzzy matches query against destination names, aliases, and states."""
        q = query.lower()
        all_dests = self._get_destinations()

        # 1. Alias lookup
        for alias, target_name in DESTINATION_ALIASES.items():
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, q):
                for d in all_dests:
                    if target_name.lower() in d.destination_name.lower() or d.destination_name.lower() in target_name.lower():
                        return d

        # 2. Exact or substring destination name match (longest name match first)
        sorted_dests = sorted(all_dests, key=lambda d: len(d.destination_name), reverse=True)
        for d in sorted_dests:
            clean_name = re.sub(r'\(.*?\)', '', d.destination_name).strip().lower()
            if len(clean_name) >= 3:
                pattern = r'\b' + re.escape(clean_name) + r'\b'
                if re.search(pattern, q) or clean_name in q:
                    return d

        # 3. Individual significant words (e.g. "Munnnar" -> "Munnar", "Kovalam")
        words = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', q) if w not in {
            'plan', 'trip', 'days', 'best', 'time', 'visit', 'pack', 'food', 'reach',
            'cost', 'hotel', 'train', 'flight', 'tour', 'travel', 'budget', 'under',
            'what', 'where', 'when', 'which', 'safe', 'safety', 'weather', 'within'
        }]
        for w in words:
            for d in all_dests:
                d_lower = d.destination_name.lower()
                if w in d_lower:
                    return d

        # 4. State match
        for d in sorted_dests:
            if d.state.lower() in q:
                return d

        return None

    def _extract_duration(self, query: str, default_days: float = 3.0) -> int:
        """Extracts requested trip duration in days from text."""
        match = re.search(r'(\d+)\s*(?:-|to)?\s*(\d+)?\s*(?:day|days|night|nights)', query.lower())
        if match:
            days = int(match.group(1))
            return max(1, min(days, 14))
        
        # Word numbers
        word_map = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'week': 7}
        for word, val in word_map.items():
            if re.search(r'\b' + word + r'\s*(?:day|days|night|nights)?\b', query.lower()):
                return val

        return int(default_days) if default_days else 3

    def _extract_budget(self, query: str):
        """Extracts requested budget amount in INR if mentioned."""
        # e.g. "15,000", "15000", "20k", "under 10000"
        match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(?:k|thousand)?', query.lower())
        if match:
            val_str = match.group(1).replace(',', '')
            val = float(val_str)
            if 'k' in query.lower() or 'thousand' in query.lower() and val < 500:
                val *= 1000
            if val >= 500: # realistic budget threshold
                return val
        return None

    def _handle_greeting(self) -> dict:
        """Generates friendly, helpful welcoming answer."""
        text = (
            "Hello! I am your **TravelBuddy AI Travel Assistant**.\n\n"
            "I am grounded directly in verified data across **100 premier Indian destinations**—including real "
            "INR budget categories, safety ratings, weather windows, packing checklists, transit connections, and local cuisines.\n\n"
            "Here is how I can assist you right now:\n"
            "• **Custom Itineraries:** Ask *\"Plan a 4-day trip to Goa within ₹15,000\"* or *\"3-day heritage tour of Varanasi\"*.\n"
            "• **Packing & Gear:** Ask *\"What should I pack for Ladakh in winter?\"* or *\"Clothes for Kerala backwaters\"*.\n"
            "• **Weather & Seasons:** Ask *\"What is the best time to visit Munnar?\"* or *\"Is monsoon safe for Spiti?\"*.\n"
            "• **Transit Logistics:** Ask *\"How do I reach Manali from Delhi?\"* or *\"Nearest airport to Hampi\"*.\n"
            "• **Local Food & Culture:** Ask *\"Must-try street food in Jaipur\"* or *\"Vegetarian spots in Rishikesh\"*.\n\n"
            "Where would you like to travel next?"
        )
        # Select 3 iconic diverse destinations for quick inspiration
        all_d = self._get_destinations()
        sample_dests = [d for d in all_d if d.destination_name in ['Goa', 'Ladakh (Leh)', 'Jaipur']]
        if not sample_dests:
            sample_dests = all_d[:3]
        return {
            'text': text,
            'destinations': [d.to_dict() for d in sample_dests],
            'confidence': 0.98
        }

    def _handle_itinerary(self, dest: Destination, query: str) -> dict:
        """Constructs authentic, grounded day-by-day itinerary tailored to requested days and budget."""
        duration = self._extract_duration(query, default_days=dest.ideal_days or 3)
        user_budget = self._extract_budget(query)
        mid_tier = dest.mid_range_category if isinstance(dest.mid_range_category, dict) else {}
        mid_range = mid_tier.get('total_daily_range', [2500, 5500])
        avg_daily = (mid_range[0] + mid_range[1]) // 2
        estimated_total = avg_daily * duration

        attractions = dest.primary_attractions or []
        activities = dest.activities_available or []
        hidden_gems = dest.hidden_gems or []
        dishes = dest.local_cuisine_must_try or []

        # Build day-by-day breakdown
        days_plan = []
        for i in range(1, duration + 1):
            if i == 1:
                first_attr = attractions[0] if attractions else "Central town square"
                eve_dish = dishes[0] if dishes else "local specialty thali"
                days_plan.append(
                    f"• **Day 1 — Arrival, Orientation & Sunset Vibes:**\n"
                    f"  Check in to your hotel and unwind. In the afternoon, visit **{first_attr}**. "
                    f"Head to a scenic local viewpoint for sunset, followed by a welcome dinner featuring **{eve_dish}**."
                )
            elif i == 2:
                second_attr = attractions[1] if len(attractions) > 1 else "cultural district"
                act = activities[0] if activities else "heritage walk"
                days_plan.append(
                    f"• **Day 2 — Deep Cultural & Landmark Exploration:**\n"
                    f"  Start early to beat the crowds at **{second_attr}**. Spend the midday exploring traditional bazaars and handicraft ateliers. "
                    f"In the afternoon, experience **{act}** and enjoy traditional tea and snacks."
                )
            elif i == 3:
                gem = hidden_gems[0] if hidden_gems else (attractions[2] if len(attractions) > 2 else "scenic countryside")
                second_dish = dishes[1] if len(dishes) > 1 else (dishes[0] if dishes else "authentic regional cuisine")
                days_plan.append(
                    f"• **Day 3 — Off-the-Beaten-Path & Adventure:**\n"
                    f"  Venture beyond the standard tourist trail to **{gem}**. Enjoy outdoor photography, take in panoramic landscapes, "
                    f"and stop by a heritage cafe to try **{second_dish}**."
                )
            else:
                next_attr = attractions[(i - 1) % len(attractions)] if attractions else "local village & artisanal shops"
                days_plan.append(
                    f"• **Day {i} — Relaxation, Excursions & Souvenir Trail:**\n"
                    f"  Dedicate the morning to **{next_attr}** or a relaxing nature walk. "
                    f"Spend your final evening picking up authentic spices, textiles, or souvenirs before departure."
                )

        # Budget analysis
        budget_analysis = ""
        if user_budget:
            if user_budget >= estimated_total * 0.8:
                budget_analysis = (
                    f"**Budget Assessment:** Your target budget of **₹{user_budget:,.0f}** is **comfortably feasible** "
                    f"for a {duration}-day trip to {dest.destination_name} (standard mid-range estimate is ~₹{estimated_total:,.0f} for {duration} days)."
                )
            else:
                budget_analysis = (
                    f"**Budget Assessment:** Your target budget of **₹{user_budget:,.0f}** for {duration} days is on the **cost-conscious budget tier**. "
                    f"To comfortably make it work, opt for verified guesthouses/homestays, use local transport (shared cabs or state buses), "
                    f"and enjoy meals at local eateries (typical budget tier is ₹{dest.budget_category.get('total_daily_range', [1200, 2200])[0]:,}–"
                    f"₹{dest.budget_category.get('total_daily_range', [1200, 2200])[1]:,}/day)."
                )
        else:
            budget_analysis = (
                f"**Estimated Mid-Range Budget:** ~**₹{estimated_total:,.0f} per person** for {duration} days "
                f"(₹{mid_range[0]:,}–₹{mid_range[1]:,}/day covering 3-star boutique stay, meals, local transport & entry fees)."
            )

        reply_text = (
            f"Here is your personalized **{duration}-Day Itinerary** for **{dest.destination_name}** ({dest.state}):\n\n"
            + "\n\n".join(days_plan) + "\n\n"
            f"💰 {budget_analysis}\n\n"
            f"🛡️ **Safety & Practical Advice:** Rated **{dest.safety_rating}/10** — {clean_text(dest.safety_notes)}\n"
            f"🗓️ **Best Season to Travel:** {dest.peak_tourist_season or 'October to March'}."
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.96
        }

    def _handle_packing(self, dest: Destination) -> dict:
        """Provides terrain- and altitude-aware packing recommendations."""
        altitude = dest.altitude_m or 0
        is_mountain = altitude > 1500 or any(t.lower() in str(dest.trip_types).lower() for t in ['mountain', 'trekking', 'hill', 'snow'])
        is_beach = any(t.lower() in str(dest.trip_types).lower() for t in ['beach', 'coastal', 'island']) or dest.state in ['Goa', 'Kerala', 'Andaman and Nicobar Islands']

        checklist = []
        if is_mountain:
            checklist.extend([
                "• **Clothing & Layers:** Thermal base layers (merino wool/synthetic), fleece mid-layer, windproof & waterproof down jacket.",
                "• **Footwear:** Broken-in high-ankle trekking shoes with deep traction lugs, plus 3-4 pairs of moisture-wicking wool socks.",
                "• **Sun & Eye Protection:** UV-400 polarized sunglasses (UV radiation is significantly higher at altitude), SPF 50+ broad-spectrum sunscreen, and petroleum/hydrating lip balm.",
                "• **Altitude & Health:** Electrolyte hydration packs, Diamox (consult doctor prior to departure), portable pulse oximeter, and insulated flask for warm water.",
                "• **Electronics:** High-capacity power bank (cold temperatures deplete lithium batteries 40% faster)."
            ])
        elif is_beach:
            checklist.extend([
                "• **Clothing:** Breathable linen shirts, lightweight cotton tees, quick-dry swim trunks / swimwear, and UV rash guards.",
                "• **Footwear:** Water-resistant sandals, breathable flip-flops, and slip-on sneakers for town walks.",
                "• **Sun Care:** Reef-safe waterproof sunscreen (SPF 50+), polarized sunglasses, wide-brim sun hat, and soothing aloe vera gel.",
                "• **Beach Gear:** Dry bag (10L-15L) for electronics on boat trips, quick-dry microfiber towel, and waterproof phone pouch."
            ])
        else:
            checklist.extend([
                "• **Clothing:** Lightweight, modest, breathable cotton clothing. Long linen trousers and shirts covering shoulders/knees for temples and forts.",
                "• **Footwear:** Comfortable cushioned walking shoes for cobbled paths, and easy-to-slip-off sandals for temple entrances.",
                "• **Sun Protection:** Lightweight cotton scarf / dupatta (useful for sun protection and required head covering at spiritual shrines), sunglasses, and SPF 30+ sunscreen.",
                "• **Day Essentials:** Anti-theft cross-body daypack, reusable stainless steel water bottle, and compact umbrella."
            ])

        checklist.append("• **Universal Essentials:** Government Photo ID / Aadhaar / Passport, physical cash (small denominations for local vendors), and essential personal medications.")

        reply_text = (
            f"Here is your tailored **Packing & Gear Guide** for **{dest.destination_name}** ({dest.state}, Altitude: {altitude}m):\n\n"
            + "\n".join(checklist) + "\n\n"
            f"ℹ️ **Connectivity Note:** Mobile networks available: {', '.join(dest.mobile_network or ['Jio', 'Airtel'])}. "
            f"ATM availability: {dest.atm_availability or 'Available in main market areas'}."
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.95
        }

    def _handle_weather(self, dest: Destination) -> dict:
        """Provides verified climate windows, peak seasons, and monsoon advisories."""
        avg_temp = dest.average_temperature if isinstance(dest.average_temperature, dict) else {}
        winter_temp = avg_temp.get('winter', '15-25°C')
        summer_temp = avg_temp.get('summer', '25-35°C')
        monsoon_temp = avg_temp.get('monsoon', '22-30°C')

        best_seasons_str = clean_text(', '.join(dest.best_seasons or ['October to March']))
        avoid_seasons_str = clean_text(', '.join(dest.avoid_seasons or ['Peak monsoon weeks for heavy rains']))

        reply_text = (
            f"Here is the verified **Climate & Seasonal Weather Guide** for **{dest.destination_name}** ({dest.state}):\n\n"
            f"☀️ **Peak Tourist Season:** {clean_text(dest.peak_tourist_season or 'October to March')} — Ideal weather, crystal clear skies, and lively festivals.\n"
            f"🌧️ **Off-Season / Avoid Windows:** {clean_text(dest.off_season or 'Monsoon period')} — {avoid_seasons_str}.\n"
            f"📅 **Recommended Travel Window:** {best_seasons_str}\n\n"
            f"🌡️ **Temperature Overview:**\n"
            f"• **Winter:** {winter_temp}\n"
            f"• **Summer:** {summer_temp}\n"
            f"• **Monsoon:** {monsoon_temp}\n\n"
            f"🌧️ **Rainfall Pattern:** {clean_text(dest.rainfall_pattern or 'Seasonal tropical monsoon with occasional heavy showers.')}"
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.95
        }

    def _handle_transit(self, dest: Destination) -> dict:
        """Provides airport, railway, and highway logistics with verified distances."""
        airport = dest.nearest_airport if isinstance(dest.nearest_airport, dict) else {}
        airport_name = airport.get('name', 'Nearest regional airport')
        airport_dist = airport.get('distance_km', 'N/A')

        railway = dest.nearest_railway_station if isinstance(dest.nearest_railway_station, dict) else {}
        railway_name = railway.get('name', 'Nearest major junction')
        railway_dist = railway.get('distance_km', 'N/A')

        city = dest.nearest_major_city if isinstance(dest.nearest_major_city, dict) else {}
        city_name = city.get('name', 'Nearest commercial center')
        city_dist = city.get('distance_km', 'N/A')

        reply_text = (
            f"Here are the complete **Transit & Route Logistics** for **{dest.destination_name}** ({dest.state}):\n\n"
            f"✈️ **Nearest Airport:**\n"
            f"• **{airport_name}** — approximately **{airport_dist} km** from the destination center. Pre-paid taxis and app cabs are generally accessible.\n\n"
            f"🚆 **Nearest Railway Station:**\n"
            f"• **{railway_name}** — approximately **{railway_dist} km** away. Connected via express and superfast trains.\n\n"
            f"🛣️ **Road & Highway Connectivity:**\n"
            f"• Status: **{dest.road_connectivity or 'Well connected via National & State Highways'}**.\n"
            f"• Nearest Major City: **{city_name}** (~{city_dist} km).\n\n"
            f"💡 **Logistics Tip:** Local travel inside {dest.destination_name} is best navigated via "
            f"{'self-drive scooters / rental cabs' if 'beach' in str(dest.trip_types).lower() or dest.state == 'Goa' else 'shared sumos, private taxis, or local auto-rickshaws'}."
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.95
        }

    def _handle_food(self, dest: Destination) -> dict:
        """Recommends authentic regional cuisine, must-try dishes, and dining scenes."""
        dishes = dest.local_cuisine_must_try or []
        food_scene = clean_text(dest.food_scene or "Rich blend of traditional regional flavors and modern tourist cafes.")

        dishes_formatted = "\n".join([f"• **{clean_text(d)}**" for d in dishes]) if dishes else "• Authentic local regional thali and street snacks."

        reply_text = (
            f"Here is your **Culinary & Food Scene Guide** for **{dest.destination_name}** ({dest.state}):\n\n"
            f"🍽️ **Must-Try Local Specialties:**\n"
            f"{dishes_formatted}\n\n"
            f"🍲 **Food Scene & Ambiance:**\n"
            f"{food_scene}\n\n"
            f"💡 **Foodie Tip:** Always seek out bustling heritage eateries and community stalls with high turnover for the freshest regional preparation."
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.95
        }

    def _handle_safety(self, dest: Destination) -> dict:
        """Provides verified safety ratings, female traveler suitability, and permit rules."""
        permits_text = dest.permits_details if dest.permits_required else "No special permits or ILP (Inner Line Permit) required for Indian citizens."

        reply_text = (
            f"Here is the verified **Safety & Travel Advisory Profile** for **{dest.destination_name}** ({dest.state}):\n\n"
            f"🛡️ **Safety Score:** **{dest.safety_rating}/10**\n"
            f"📋 **Verified Field Notes:** {clean_text(dest.safety_notes or 'Generally peaceful destination with helpful locals.')}\n\n"
            f"🛂 **Permits & Regulations:**\n"
            f"• Required: **{'Yes' if dest.permits_required else 'No'}**\n"
            f"• Details: {clean_text(permits_text)}\n\n"
            f"📶 **Mobile & Emergency Connectivity:**\n"
            f"• Networks: {', '.join(dest.mobile_network or ['Jio', 'Airtel', 'Vi'])}\n"
            f"• Internet: {dest.internet_connectivity or 'Stable 4G'}\n"
            f"• ATMs: {dest.atm_availability or 'Available throughout town'}\n\n"
            f"🤝 **Cultural Customs:** {clean_text(dest.local_customs or 'Dress modestly when visiting heritage and spiritual monuments; respect local photography guidelines.')}"
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.95
        }

    def _handle_budget_query(self, dest: Destination) -> dict:
        """Breaks down budget, mid-range, and luxury tiers with exact daily INR numbers."""
        b_tier = dest.budget_category if isinstance(dest.budget_category, dict) else {}
        m_tier = dest.mid_range_category if isinstance(dest.mid_range_category, dict) else {}
        l_tier = dest.luxury_category if isinstance(dest.luxury_category, dict) else {}

        b_range = b_tier.get('total_daily_range', [1000, 2500])
        m_range = m_tier.get('total_daily_range', [2500, 6000])
        l_range = l_tier.get('total_daily_range', [6000, 20000])

        reply_text = (
            f"Here is the verified **Daily Budget Breakdown** for **{dest.destination_name}** ({dest.state}) per person:\n\n"
            f"🎒 **1. Budget Backpacker Tier: ₹{b_range[0]:,} – ₹{b_range[1]:,} / day**\n"
            f"• Stay: Clean hostels / homestays (₹{b_tier.get('accommodation_range', [500, 1200])[0]:,}–₹{b_tier.get('accommodation_range', [500, 1200])[1]:,})\n"
            f"• Meals: Street food & local messes (₹{b_tier.get('food_range', [200, 500])[0]:,}–₹{b_tier.get('food_range', [200, 500])[1]:,})\n"
            f"• Local Transport: State buses, shared autos & rentals (₹{b_tier.get('local_transport_range', [150, 400])[0]:,}–₹{b_tier.get('local_transport_range', [150, 400])[1]:,})\n\n"
            f"🧳 **2. Mid-Range Comfort Tier: ₹{m_range[0]:,} – ₹{m_range[1]:,} / day** *(Recommended)*\n"
            f"• Stay: 3-star boutique hotels & scenic cottages (₹{m_tier.get('accommodation_range', [1800, 3800])[0]:,}–₹{m_tier.get('accommodation_range', [1800, 3800])[1]:,})\n"
            f"• Meals: Multi-cuisine sit-down restaurants (₹{m_tier.get('food_range', [400, 900])[0]:,}–₹{m_tier.get('food_range', [400, 900])[1]:,})\n"
            f"• Local Transport: Private autos & cabs (₹{m_tier.get('local_transport_range', [300, 800])[0]:,}–₹{m_tier.get('local_transport_range', [300, 800])[1]:,})\n\n"
            f"✨ **3. Premium / Luxury Tier: ₹{l_range[0]:,} – ₹{l_range[1]:,}+ / day**\n"
            f"• Stay: 5-star heritage palaces, luxury villas & premium resorts (₹{l_tier.get('accommodation_range', [4500, 20000])[0]:,}–₹{l_tier.get('accommodation_range', [4500, 20000])[1]:,})\n"
            f"• Meals: Fine dining & gourmet experiences (₹{l_tier.get('food_range', [1000, 3000])[0]:,}–₹{l_tier.get('food_range', [1000, 3000])[1]:,})\n"
            f"• Local Transport: Dedicated chauffeur-driven AC car (₹{l_tier.get('local_transport_range', [800, 2500])[0]:,}–₹{l_tier.get('local_transport_range', [800, 2500])[1]:,})"
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.96
        }

    def _handle_destination_summary(self, dest: Destination) -> dict:
        """Comprehensive profile of a specific destination."""
        tier = dest.mid_range_category if isinstance(dest.mid_range_category, dict) else {}
        cost_range = tier.get('total_daily_range', [2500, 5000])
        attractions = (dest.primary_attractions or [])[:4]
        dishes = (dest.local_cuisine_must_try or [])[:3]

        reply_text = (
            f"Here is the verified travel dossier for **{dest.destination_name}** ({dest.state}):\n\n"
            f"• **Highlights & Landmarks:** {', '.join(attractions)}\n"
            f"• **Recommended Duration:** {dest.ideal_days} days (min {dest.minimum_days} – max {dest.maximum_days} days)\n"
            f"• **Ideal For:** {', '.join(dest.ideal_for or ['Couples', 'Solo Explorers', 'Families'])}\n"
            f"• **Peak Travel Window:** {clean_text(dest.peak_tourist_season or 'October to March')}\n"
            f"• **Estimated Daily Spend:** ₹{cost_range[0]:,} – ₹{cost_range[1]:,} / person (mid-range)\n"
            f"• **Must-Try Dishes:** {', '.join(dishes) if dishes else 'Regional cuisine'}\n"
            f"• **Safety Rating:** {dest.safety_rating}/10 — {clean_text(dest.safety_notes)}\n\n"
            f"💡 *Would you like me to generate a day-by-day itinerary, packing list, or transit route for {dest.destination_name}?*"
        )

        return {
            'text': reply_text,
            'destinations': [dest.to_dict()],
            'confidence': 0.96
        }

    def _call_gemini_if_available(self, message: str, matched_dest: Destination) -> str:
        """Calls Google Gemini API if GEMINI_API_KEY or GOOGLE_API_KEY is configured in environment."""
        api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not api_key:
            return None

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            context = ""
            if matched_dest:
                context = f"\nGROUND TRUTH DATASET RECORD FOR {matched_dest.destination_name}:\n{json.dumps(matched_dest.to_dict(), default=str)}"

            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    "You are TravelBuddy AI, an expert travel consultant specializing in India. "
                                    "Provide highly structured, practical, formatted responses using INR currency. "
                                    "Adhere strictly to the verified Indian tourism dataset ground truth if provided.\n"
                                    f"{context}\n\n"
                                    f"User Question: {message}"
                                )
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 800
                }
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=4.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                candidates = data.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    if parts and 'text' in parts[0]:
                        return parts[0]['text'].strip()
        except Exception:
            return None

        return None

    def process_message(self, message: str) -> dict:
        """Processes user travel query and generates grounded, factual answers."""
        raw_msg = message.strip()
        q = raw_msg.lower()
        all_destinations = self._get_destinations()

        # 1. Greetings & Introductory questions
        greeting_patterns = [
            r'^(hi|hello|hey|namaste|greetings|hola)\b',
            r'\b(who are you|what can you do|how can you help|what is travelbuddy|help me)\b',
            r'^start\b'
        ]
        if any(re.search(pat, q) for pat in greeting_patterns) and len(q.split()) <= 6:
            return self._handle_greeting()

        # 2. Check for specific destination mention
        matched_dest = self._find_matching_destination(q)

        # 3. If Gemini is available, attempt grounded generation
        gemini_reply = self._call_gemini_if_available(raw_msg, matched_dest)
        if gemini_reply:
            dests = [matched_dest.to_dict()] if matched_dest else []
            return {
                'text': gemini_reply,
                'destinations': dests,
                'confidence': 0.98
            }

        # 4. Handle questions when destination is identified
        if matched_dest:
            # A. Packing question
            if any(w in q for w in ['pack', 'packing', 'cloth', 'clothes', 'wear', 'jacket', 'shoes', 'what to bring']):
                return self._handle_packing(matched_dest)

            # B. Weather / Season question
            if any(w in q for w in ['weather', 'temperature', 'season', 'when to visit', 'best time', 'month', 'rain', 'monsoon', 'climate']):
                return self._handle_weather(matched_dest)

            # C. Transit / Logistics question
            if any(w in q for w in ['how to reach', 'how to get', 'nearest airport', 'airport', 'railway', 'train', 'flight', 'bus', 'road connectivity', 'reach']):
                return self._handle_transit(matched_dest)

            # D. Food question
            if any(w in q for w in ['food', 'cuisine', 'eat', 'dish', 'dishes', 'restaurant', 'thali', 'must try', 'street food', 'dining']):
                return self._handle_food(matched_dest)

            # E. Safety / Permits question
            if any(w in q for w in ['safe', 'safety', 'solo', 'female', 'woman', 'women', 'permit', 'permits', 'crime', 'night', 'security']):
                return self._handle_safety(matched_dest)

            # F. Budget breakdown question
            if any(w in q for w in ['how much', 'cost breakdown', 'budget category', 'expense', 'daily budget', 'tier', 'cost of stay']):
                return self._handle_budget_query(matched_dest)

            # G. Itinerary / Plan question (or mentions days/duration/budget with destination)
            if any(w in q for w in ['plan', 'itinerary', 'day', 'days', 'schedule', 'trip', 'tour', 'visit', 'explore', 'within', 'under']):
                return self._handle_itinerary(matched_dest, q)

            # Default for matched destination: rich dossier
            return self._handle_destination_summary(matched_dest)

        # 5. Beach / Coastal
        if any(w in q for w in ['beach', 'coastal', 'sea', 'ocean', 'island', 'scuba']):
            matches = [d for d in all_destinations if 'beach' in str(d.trip_types).lower() or d.state in ['Goa', 'Kerala', 'Andaman and Nicobar Islands']]
            matches = matches[:3]
            return {
                'text': (
                    "Looking for sun-kissed beaches and seaside relaxation? Here are top coastal paradises from our database:\n\n"
                    "• **Goa:** Iconic golden sands, watersports, colonial Portuguese heritage, and vibrant beach shacks.\n"
                    "• **Andaman Islands (Havelock & Neil):** World-class Radhanagar Beach, turquoise lagoons, and vibrant coral diving.\n"
                    "• **Alleppey (Alappuzha):** Palm-fringed backwaters, traditional Kettuvallam houseboats, and Arabian sea beaches.\n\n"
                    "💡 *You can ask me to plan a custom day-by-day itinerary or check verified budgets for any of these!*"
                ),
                'destinations': [d.to_dict() for d in matches],
                'confidence': 0.94
            }

        # 6. Mountains / High Altitude / Snow / Trekking
        if any(w in q for w in ['mountain', 'himalaya', 'snow', 'trek', 'altitude', 'hill station', 'hill']):
            matches = [d for d in all_destinations if d.altitude_m > 1500 or any(t in str(d.trip_types).lower() for t in ['mountain', 'trekking', 'skiing'])]
            matches = matches[:3]
            return {
                'text': (
                    "For crisp mountain air, panoramic peaks, and alpine adventures, here are top-tier mountain escapes:\n\n"
                    "• **Ladakh (Leh):** High-altitude desert, ancient cliffside monasteries, Pangong Tso, and Khardung La.\n"
                    "• **Manali:** Snow-capped Pir Panjal ranges, Solang Valley paragliding, and Rohtang Pass.\n"
                    "• **Spiti Valley:** Surreal Himalayan moonscapes, Key Monastery, and world-class stargazing.\n\n"
                    "💡 *Ask me for packing tips or optimal acclimatization schedules for these high-altitude spots!*"
                ),
                'destinations': [d.to_dict() for d in matches],
                'confidence': 0.94
            }

        # 7. Heritage / Culture / History
        if any(w in q for w in ['heritage', 'history', 'fort', 'palace', 'monument', 'temple', 'culture', 'architecture']):
            matches = [d for d in all_destinations if any(t in str(d.trip_types).lower() for t in ['heritage', 'cultural', 'religious'])]
            matches = matches[:3]
            return {
                'text': (
                    "India's millennia-old architectural and spiritual heritage is extraordinary. Here are top historic destinations:\n\n"
                    "• **Jaipur:** The Pink City's grand Amer Fort, City Palace, and Hawa Mahal.\n"
                    "• **Agra:** The timeless Taj Mahal, Agra Fort, and Mughal architectural grandeur.\n"
                    "• **Varanasi:** Ancient sacred ghats, evening Ganga Aarti, and centuries of spiritual living history.\n\n"
                    "💡 *Ask me for dress codes, sunrise boat schedules, or authentic local food recommendations!*"
                ),
                'destinations': [d.to_dict() for d in matches],
                'confidence': 0.94
            }

        # 8. Budget / Affordable trips across India
        if any(w in q for w in ['budget', 'cheap', 'affordable', 'under', 'low cost', 'inexpensive']):
            budget_spots = sorted(
                all_destinations,
                key=lambda d: (d.budget_category or {}).get('total_daily_range', [9999, 9999])[0]
            )[:3]
            return {
                'text': (
                    "Here are outstanding destinations optimized for cost-conscious travelers, with daily total ranges "
                    "starting under ₹1,500/day including stay and meals:\n\n"
                    f"• **{budget_spots[0].destination_name}:** Starts at ~₹{(budget_spots[0].budget_category or {}).get('total_daily_range', [1000])[0]:,}/day.\n"
                    f"• **{budget_spots[1].destination_name}:** Starts at ~₹{(budget_spots[1].budget_category or {}).get('total_daily_range', [1000])[0]:,}/day.\n"
                    f"• **{budget_spots[2].destination_name}:** Starts at ~₹{(budget_spots[2].budget_category or {}).get('total_daily_range', [1000])[0]:,}/day.\n\n"
                    "Stay in verified homestays or backpacker hostels and savor local cuisine to keep costs minimal without missing any wonder."
                ),
                'destinations': [d.to_dict() for d in budget_spots],
                'confidence': 0.92
            }

        # 9. Default Recommendation Fallback
        recommended = recommender.get_personalized_recommendations(top_n=3)
        dest_objects = [r['destination'] for r in recommended]
        return {
            'text': (
                "Based on our 100-destination tourism index, here are three highly recommended journeys across India "
                "with verified safety ratings, transparent INR budgets, and day-by-day itineraries:\n\n"
                f"• **{dest_objects[0]['destination_name']}** ({dest_objects[0]['state']}): {dest_objects[0]['trip_types'][0]} wonder.\n"
                f"• **{dest_objects[1]['destination_name']}** ({dest_objects[1]['state']}): {dest_objects[1]['trip_types'][0]} wonder.\n"
                f"• **{dest_objects[2]['destination_name']}** ({dest_objects[2]['state']}): {dest_objects[2]['trip_types'][0]} wonder.\n\n"
                "Tell me your preferred travel style, budget, or destination name, and I will tailor an exact day-by-day itinerary for you!"
            ),
            'destinations': dest_objects,
            'confidence': 0.85
        }

assistant_service = AssistantService()

