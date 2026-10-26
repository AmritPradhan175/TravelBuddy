import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Sparkles } from 'lucide-react';
import { destinationsData } from '../data/destinations';
import { DestinationCard } from '../components/shared/DestinationCard';
import { useAuth } from '../context/AuthContext';

export const FavoritesPage: React.FC = () => {
  const { favorites } = useAuth();
  const savedDestinations = destinationsData.filter(d => favorites.includes(d.id));

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            <Bookmark className="w-4 h-4 text-forest-700" />
            <span>Saved Bucket List</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
            Your Bookmarked Destinations ({savedDestinations.length})
          </h1>
          <p className="text-travel-muted text-sm mt-1 max-w-xl">
            Keep track of places you're dreaming of visiting. Generate itineraries directly from your saved list.
          </p>
        </div>

        {savedDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {savedDestinations.map(d => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-travel-border p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-900">No destinations saved yet</h3>
            <p className="text-xs text-travel-muted">
              Explore our 100 destinations across India and click the bookmark button on any card to save it here.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Places Now</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
