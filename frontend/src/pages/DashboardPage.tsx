import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Bookmark, 
  History, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Star, 
  User as UserIcon, 
  Trash2,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { destinationsData, type Destination } from '../data/destinations';
import { DestinationCard } from '../components/shared/DestinationCard';
import { formatCurrency } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user, favorites, searchHistory, viewedDestinations, clearSearchHistory } = useAuth();
  
  // Load saved trips from localStorage
  const [savedTrips, setSavedTrips] = useState<any[]>(() => {
    const saved = localStorage.getItem('tb_saved_trips');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    // Default mock trip if none saved yet
    return [
      {
        id: 'trip_default_01',
        destination: 'Ladakh (Leh)',
        state: 'Ladakh',
        image_url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80',
        duration: 5,
        travelers: 2,
        budgetTier: 'mid_range',
        totalCost: 32500,
        created_at: '2026-10-20',
      }
    ];
  });

  // Favorite destinations objects
  const favoriteDestinations = destinationsData.filter(d => favorites.includes(d.id));

  // Recently viewed destinations objects
  const viewedDestObjects = destinationsData.filter(d => viewedDestinations.includes(d.id)).slice(0, 4);

  // Personalized ML recommendations based on user travel styles (Nature, Heritage, etc.)
  const recommendations = destinationsData
    .filter(d => !favorites.includes(d.id) && (d.trip_types?.includes('Nature') || d.trip_types?.includes('Cultural') || d.popularity_score >= 8))
    .slice(0, 3);

  const handleDeleteTrip = (tripId: string) => {
    const updated = savedTrips.filter(t => t.id !== tripId);
    setSavedTrips(updated);
    localStorage.setItem('tb_saved_trips', JSON.stringify(updated));
  };

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl border border-travel-border p-6 md:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.full_name || 'Traveler'}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-forest-100 shadow-xs"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900">
                  Welcome back, {user?.full_name || 'Explorer'}!
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-accent text-forest-900">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-travel-muted">
                {user?.email} · Member since Oct 2026 · Base: {user?.home_city || 'Bengaluru, India'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user?.preferences?.travel_styles.map((style, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-forest-50 text-forest-800 font-medium">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/plan-trip"
              className="px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs tracking-wide shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan New Journey</span>
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2.5 rounded-full bg-white border border-travel-border text-forest-800 font-semibold text-xs hover:bg-forest-50 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Dashboard Quick Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-travel-border shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-travel-muted font-semibold block">
              Saved Places
            </span>
            <span className="font-serif text-3xl font-bold text-forest-900 mt-1 block">
              {favorites.length}
            </span>
            <Link to="/favorites" className="text-xs text-forest-700 font-medium hover:underline mt-1 inline-block">
              View bucket list →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-travel-border shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-travel-muted font-semibold block">
              Created Itineraries
            </span>
            <span className="font-serif text-3xl font-bold text-forest-900 mt-1 block">
              {savedTrips.length}
            </span>
            <Link to="/my-trips" className="text-xs text-forest-700 font-medium hover:underline mt-1 inline-block">
              Manage trips →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-travel-border shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-travel-muted font-semibold block">
              Recent Searches
            </span>
            <span className="font-serif text-3xl font-bold text-forest-900 mt-1 block">
              {searchHistory.length}
            </span>
            <Link to="/history" className="text-xs text-forest-700 font-medium hover:underline mt-1 inline-block">
              View history →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-travel-border shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-travel-muted font-semibold block">
              Places Explored
            </span>
            <span className="font-serif text-3xl font-bold text-forest-900 mt-1 block">
              {viewedDestinations.length}
            </span>
            <span className="text-xs text-travel-muted mt-1 block">Across 30 states</span>
          </div>
        </div>

        {/* Saved Trips Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-forest-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest-700" />
              Your Saved Trips & Itineraries
            </h2>
            <Link to="/plan-trip" className="text-xs font-semibold text-forest-800 hover:underline">
              + Create Another Trip
            </Link>
          </div>

          {savedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl border border-travel-border overflow-hidden shadow-xs hover:shadow-card transition-all flex flex-col justify-between">
                  <div className="aspect-[16/9] relative">
                    <img
                      src={trip.image_url}
                      alt={trip.destination}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <h4 className="font-serif text-lg font-bold">{trip.destination}</h4>
                        <p className="text-[11px] text-ivory-muted">{trip.state} · {trip.duration} Days</p>
                      </div>
                      <span className="text-xs font-bold text-lime-accent">
                        {formatCurrency(trip.totalCost)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-xs text-travel-muted">
                      <span>Travelers: {trip.travelers} Persons</span>
                      <span>Tier: {trip.budgetTier?.replace('_', '-')}</span>
                    </div>

                    <div className="pt-2 border-t border-travel-border flex items-center justify-between">
                      <Link
                        to={`/plan-trip?dest=${encodeURIComponent(trip.destination)}&days=${trip.duration}`}
                        className="text-xs font-semibold text-forest-800 hover:underline"
                      >
                        View & Edit Itinerary →
                      </Link>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete saved trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-travel-border text-center text-xs text-travel-muted">
              No trips saved yet. Click "Plan New Journey" to generate your first itinerary!
            </div>
          )}
        </div>

        {/* Saved Bucket List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-forest-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-forest-700" />
              Saved Bucket List ({favoriteDestinations.length})
            </h2>
            <Link to="/favorites" className="text-xs font-semibold text-forest-800 hover:underline">
              View All Favorites →
            </Link>
          </div>

          {favoriteDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favoriteDestinations.slice(0, 4).map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-travel-border text-center text-xs text-travel-muted">
              No saved destinations yet. Explore places and tap the bookmark icon on any card!
            </div>
          )}
        </div>

        {/* Personalized ML Recommendations for You */}
        <div className="space-y-4 pt-4 border-t border-travel-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-forest-700 block">
                MACHINE LEARNING ENGINE
              </span>
              <h2 className="font-serif text-2xl font-bold text-forest-900">
                Recommended For Your Travel Profile
              </h2>
            </div>
            <Link to="/explore" className="text-xs font-semibold text-forest-800 hover:underline">
              Browse More Matches →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>

        {/* Recent Searches & Browsing Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-travel-border">
          
          {/* Searches */}
          <div className="bg-white rounded-2xl border border-travel-border p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-travel-border pb-2">
              <h3 className="font-serif text-lg font-bold text-forest-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-forest-700" />
                Recent Search Queries
              </h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={clearSearchHistory}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Clear History
                </button>
              )}
            </div>

            {searchHistory.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, idx) => (
                  <Link
                    key={idx}
                    to={`/explore?search=${encodeURIComponent(query)}`}
                    className="px-3 py-1.5 rounded-full bg-ivory hover:bg-forest-50 border border-travel-border text-xs text-forest-900 font-medium transition-colors"
                  >
                    "{query}"
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-travel-muted">No search queries recorded yet.</p>
            )}
          </div>

          {/* Recently Viewed Places */}
          <div className="bg-white rounded-2xl border border-travel-border p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-travel-border pb-2">
              <h3 className="font-serif text-lg font-bold text-forest-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest-700" />
                Recently Viewed Places
              </h3>
              <Link to="/history" className="text-[11px] text-forest-800 hover:underline">
                View Full Log
              </Link>
            </div>

            <div className="space-y-2">
              {viewedDestObjects.map((dest) => (
                <Link
                  key={dest.id}
                  to={`/destinations/${dest.id}`}
                  className="p-2.5 rounded-xl bg-ivory hover:bg-forest-50 border border-travel-border flex items-center justify-between transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={dest.image_url}
                      alt={dest.destination_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <strong className="text-forest-900 block">{dest.destination_name}</strong>
                      <span className="text-travel-muted text-[11px]">{dest.state} · {dest.trip_types?.[0]}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-travel-muted" />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
