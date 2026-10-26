import React from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Eye, Trash2, ArrowRight, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { destinationsData } from '../data/destinations';

export const HistoryPage: React.FC = () => {
  const { searchHistory, clearSearchHistory, viewedDestinations } = useAuth();
  const viewedDestObjects = destinationsData.filter(d => viewedDestinations.includes(d.id));

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            <History className="w-4 h-4 text-forest-700" />
            <span>Activity Log</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
            Search & Browsing History
          </h1>
          <p className="text-travel-muted text-sm mt-1 max-w-xl">
            Review your recent searches and places you've explored. All records are stored securely with full privacy controls.
          </p>
        </div>

        {/* Search History Card */}
        <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-travel-border pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-forest-700" />
              <h2 className="font-serif text-xl font-bold text-forest-900">
                Recent Destination Searches ({searchHistory.length})
              </h2>
            </div>
            {searchHistory.length > 0 && (
              <button
                onClick={clearSearchHistory}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Searches</span>
              </button>
            )}
          </div>

          {searchHistory.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {searchHistory.map((query, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 px-3 rounded-xl bg-ivory border border-travel-border text-xs">
                  <span className="font-medium text-forest-900">"{query}"</span>
                  <Link
                    to={`/explore?search=${encodeURIComponent(query)}`}
                    className="text-forest-700 hover:text-forest-900 font-semibold"
                  >
                    Search again →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-travel-muted py-2">No searches recorded yet.</p>
          )}
        </div>

        {/* Viewed Destinations Log */}
        <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-travel-border pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-forest-700" />
              <h2 className="font-serif text-xl font-bold text-forest-900">
                Recently Viewed Places ({viewedDestObjects.length})
              </h2>
            </div>
          </div>

          {viewedDestObjects.length > 0 ? (
            <div className="space-y-3 pt-2">
              {viewedDestObjects.map((dest) => (
                <div
                  key={dest.id}
                  className="p-4 rounded-2xl bg-ivory border border-travel-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={dest.image_url}
                      alt={dest.destination_name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-serif text-base font-bold text-forest-900">
                        {dest.destination_name}
                      </h4>
                      <p className="text-xs text-travel-muted">
                        {dest.state}, {dest.region} · {dest.trip_types?.[0]} · {dest.ideal_days}d recommended
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/destinations/${dest.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors self-start sm:self-auto"
                  >
                    <span>View Again</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-travel-muted py-2">You haven't viewed any destination details yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};
