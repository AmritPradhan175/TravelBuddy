import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, Bookmark, ArrowUpRight } from 'lucide-react';
import type { Destination } from '../../types/destination';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';

interface DestinationCardProps {
  destination: Destination;
  showBudget?: boolean;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ 
  destination, 
  showBudget = true 
}) => {
  const { isFavorite, toggleFavorite, recordDestinationView } = useAuth();
  const favorited = isFavorite(destination.id);

  const primaryCategory = Array.isArray(destination.trip_types) && destination.trip_types.length > 0 
    ? destination.trip_types[0] 
    : 'Scenic';

  // Budget range for display
  const dailyRange = destination.budget_category?.total_daily_range;
  const minBudget = dailyRange ? dailyRange[0] : null;
  const maxBudget = dailyRange ? dailyRange[1] : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(destination.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-travel-border overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col h-full">
      
      {/* Top Image & Overlays */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-forest-50">
        <img
          src={destination.image_url}
          alt={destination.destination_name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/70 via-transparent to-black/20 pointer-events-none" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-900/80 backdrop-blur-md text-lime-accent border border-white/10 shadow-xs">
            {primaryCategory}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remove from saved' : 'Save to favorites'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            favorited 
              ? 'bg-lime-accent text-forest-900 shadow-sm scale-110' 
              : 'bg-white/80 text-forest-800 hover:bg-white hover:text-forest-900'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${favorited ? 'fill-forest-900' : ''}`} />
        </button>

        {/* Popularity Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-forest-900/90 backdrop-blur-sm text-white text-xs font-medium">
          <Star className="w-3.5 h-3.5 text-lime-accent fill-lime-accent" />
          <span>{destination.popularity_score}/10</span>
          <span className="text-white/60 text-[10px]">({destination.ideal_days}d ideal)</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1 text-xs font-medium text-travel-muted mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
            <span className="truncate">{destination.state}, {destination.region}</span>
          </div>

          {/* Destination Name */}
          <Link
            to={`/destinations/${destination.id}`}
            onClick={() => recordDestinationView(destination.id)}
            className="group-hover:text-forest-700 transition-colors"
          >
            <h3 className="font-serif text-xl font-bold text-forest-900 leading-snug line-clamp-1">
              {destination.destination_name}
            </h3>
          </Link>

          {/* Unique experiences description */}
          <p className="mt-2 text-xs text-travel-muted leading-relaxed line-clamp-2">
            {destination.unique_experiences || destination.user_reviews_summary || `Explore the captivating attractions of ${destination.destination_name}.`}
          </p>

          {/* Primary attractions pills */}
          {Array.isArray(destination.primary_attractions) && destination.primary_attractions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {destination.primary_attractions.slice(0, 2).map((sight, idx) => (
                <span 
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-ivory-muted text-forest-800 font-medium truncate max-w-[170px]"
                >
                  {sight}
                </span>
              ))}
              {destination.primary_attractions.length > 2 && (
                <span className="text-[10px] text-travel-muted self-center">
                  +{destination.primary_attractions.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Budget & Link */}
        <div className="pt-3 border-t border-travel-border flex items-center justify-between text-xs">
          {showBudget && minBudget && maxBudget ? (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-travel-muted block">
                Daily Estimate
              </span>
              <span className="font-semibold text-forest-800">
                {formatCurrency(minBudget)} – {formatCurrency(maxBudget)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-travel-muted text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{destination.ideal_days || 3} days recommended</span>
            </div>
          )}

          <Link
            to={`/destinations/${destination.id}`}
            onClick={() => recordDestinationView(destination.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest-50 text-forest-800 font-semibold text-xs hover:bg-forest-800 hover:text-white transition-all duration-200"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
