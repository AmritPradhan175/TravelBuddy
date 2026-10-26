export type {
  Destination,
  Coordinates,
  CostCategory,
  TransportHub,
} from '../data/destinations';

export type BudgetTier = 'budget' | 'mid_range' | 'luxury';

export interface DestinationFilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedRegion: string;
  selectedSeason: string;
  selectedTravelStyle: string;
  budgetTier: BudgetTier | 'all';
  sortBy: 'popularity' | 'name' | 'ideal_days' | 'budget_asc';
}
