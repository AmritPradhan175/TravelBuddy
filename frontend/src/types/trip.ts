export interface ActivityItem {
  id: string;
  time_slot: string; // e.g. "Morning", "Afternoon", "Evening"
  title: string;
  description: string;
  estimated_cost_inr: number;
  location_name: string;
}

export interface ItineraryDay {
  day_number: number;
  date?: string;
  theme: string;
  activities: ActivityItem[];
  day_notes?: string;
}

export interface TripPlan {
  id: string;
  title: string;
  destination_id: number;
  destination_name: string;
  state: string;
  start_date: string;
  end_date: string;
  traveler_count: number;
  travel_style: string;
  budget_tier: 'budget' | 'mid_range' | 'luxury';
  total_budget_inr: number;
  estimated_cost_inr: number;
  days: ItineraryDay[];
  created_at: string;
  updated_at: string;
}
