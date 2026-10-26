import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Compass, 
  MapPin, 
  Sparkles, 
  X, 
  Check, 
  Filter, 
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { destinationsData, type Destination } from '../data/destinations';
import { DestinationCard } from '../components/shared/DestinationCard';
import { useAuth } from '../context/AuthContext';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addSearchHistory } = useAuth();

  // Search & Filter state derived from URL params or local state
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialRegion = searchParams.get('region') || 'All';
  const initialTier = searchParams.get('tier') || 'all';
  const initialSort = searchParams.get('sort') || 'popularity';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedTier, setSelectedTier] = useState(initialTier);
  const [sortBy, setSortBy] = useState(initialSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedRegion !== 'All') params.set('region', selectedRegion);
    if (selectedTier !== 'all') params.set('tier', selectedTier);
    if (sortBy !== 'popularity') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedRegion, selectedTier, sortBy, setSearchParams]);

  const categories = [
    'All',
    'Beach',
    'Mountain',
    'Heritage',
    'Cultural',
    'Adventure',
    'Wildlife',
    'Spiritual',
    'Nature',
  ];

  const regions = [
    'All',
    'North India',
    'South India',
    'West India',
    'East India',
    'Northeast India',
    'Central India',
  ];

  // Filtering & Sorting Logic
  const filteredDestinations = useMemo(() => {
    let result = [...destinationsData];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d => 
        d.destination_name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q) ||
        (Array.isArray(d.primary_attractions) && d.primary_attractions.some(a => a.toLowerCase().includes(q))) ||
        (Array.isArray(d.trip_types) && d.trip_types.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(d => {
        const types = JSON.stringify(d.trip_types).toLowerCase();
        return types.includes(selectedCategory.toLowerCase());
      });
    }

    // Region filter
    if (selectedRegion !== 'All') {
      result = result.filter(d => d.region.toLowerCase().includes(selectedRegion.toLowerCase()));
    }

    // Sort by
    if (sortBy === 'popularity') {
      result.sort((a, b) => b.popularity_score - a.popularity_score);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.destination_name.localeCompare(b.destination_name));
    } else if (sortBy === 'duration') {
      result.sort((a, b) => (b.ideal_days || 0) - (a.ideal_days || 0));
    } else if (sortBy === 'budget_asc') {
      result.sort((a, b) => {
        const costA = a.budget_category?.total_daily_range?.[0] || 0;
        const costB = b.budget_category?.total_daily_range?.[0] || 0;
        return costA - costB;
      });
    }

    return result;
  }, [searchQuery, selectedCategory, selectedRegion, selectedTier, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setSelectedTier('all');
    setSortBy('popularity');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedRegion !== 'All' || selectedTier !== 'all' || sortBy !== 'popularity';

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4" />
            <span>Destination Explorer</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-forest-900 tracking-tight">
            Discover 100 Indian Destinations
          </h1>
          <p className="text-travel-muted text-sm sm:text-base mt-2 max-w-2xl">
            Explore authentic attractions, detailed local budgets, and optimal seasons curated from our verified tourism dataset.
          </p>
        </div>

        {/* Search Bar & Controls Bar */}
        <div className="bg-white rounded-2xl border border-travel-border p-4 shadow-card mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                placeholder="Search by destination name, state, attraction, or sight..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-travel-border bg-ivory/50 text-travel-text placeholder-travel-muted text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white transition-all"
              />
              <Search className="w-5 h-5 text-travel-muted absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-travel-muted hover:text-forest-900"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Sorting & Filter Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-travel-muted">
                <ArrowUpDown className="w-4 h-4 text-forest-700" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-ivory border border-travel-border rounded-xl px-3 py-2.5 text-xs font-semibold text-forest-800 focus:outline-none cursor-pointer"
                >
                  <option value="popularity">Most Popular First</option>
                  <option value="name">Destination Name (A–Z)</option>
                  <option value="duration">Longest Recommended Trip</option>
                  <option value="budget_asc">Lowest Daily Budget</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
            <span className="text-xs font-semibold text-travel-muted uppercase tracking-wider flex-shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-forest-800 text-white font-semibold'
                    : 'bg-ivory border border-travel-border text-travel-text hover:bg-forest-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Region Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
            <span className="text-xs font-semibold text-travel-muted uppercase tracking-wider flex-shrink-0 mr-1">
              Region:
            </span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedRegion === reg
                    ? 'bg-forest-700 text-lime-accent font-semibold'
                    : 'bg-ivory border border-travel-border text-travel-muted hover:bg-forest-50'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between mb-6 text-xs text-travel-muted">
          <span>
            Showing <strong className="text-forest-900 font-semibold">{filteredDestinations.length}</strong> of {destinationsData.length} destinations
          </span>
          {selectedCategory !== 'All' && (
            <span className="px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-medium">
              Category: {selectedCategory}
            </span>
          )}
        </div>

        {/* Destinations Grid or Empty State */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-travel-border p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-forest-900">
              No matching destinations found
            </h3>
            <p className="text-xs text-travel-muted leading-relaxed">
              We couldn't find any places matching "{searchQuery}". Try removing some filters or search for popular spots like Goa, Ladakh, or Jaipur.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-full bg-forest-800 text-lime-accent font-semibold text-xs hover:bg-forest-900 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
