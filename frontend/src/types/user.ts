export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  home_city?: string;
  preferences?: {
    travel_styles: string[];
    preferred_regions: string[];
    default_budget_tier: 'budget' | 'mid_range' | 'luxury';
    currency: string;
  };
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
