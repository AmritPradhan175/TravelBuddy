import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Wallet, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { destinationsData } from '../../data/destinations';

export const TripPlannerPanel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDestination, setSelectedDestination] = useState('');
  const [duration, setDuration] = useState('5');
  const [budgetTier, setBudgetTier] = useState<'budget' | 'mid_range' | 'luxury'>('mid_range');
  const [travelStyle, setTravelStyle] = useState('All');

  // Top popular destinations for dropdown
  const topPlaces = destinationsData.slice(0, 15);

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedDestination) params.set('dest', selectedDestination);
    if (duration) params.set('days', duration);
    if (budgetTier) params.set('tier', budgetTier);
    if (travelStyle && travelStyle !== 'All') params.set('style', travelStyle);

    navigate(`/plan-trip?${params.toString()}`);
  };

  const handleExploreSubmit = () => {
    const params = new URLSearchParams();
    if (selectedDestination) params.set('search', selectedDestination);
    if (travelStyle && travelStyle !== 'All') params.set('category', travelStyle);
    if (budgetTier) params.set('tier', budgetTier);

    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-elevated border border-travel-border/80 p-4 md:p-6 backdrop-blur-lg">
      <form onSubmit={handlePlanSubmit}>
        
        {/* Top Tab Bar inside Panel */}
        <div className="flex items-center justify-between pb-4 border-b border-travel-border mb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-forest-700" />
              Smart Planning Engine
            </span>
            <span className="hidden sm:inline text-xs text-travel-muted">
              Live pricing & 100 Indian destinations
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setBudgetTier('budget')}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                budgetTier === 'budget' 
                  ? 'bg-forest-800 text-white font-semibold' 
                  : 'bg-ivory text-travel-muted hover:text-forest-800'
              }`}
            >
              Budget
            </button>
            <button
              type="button"
              onClick={() => setBudgetTier('mid_range')}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                budgetTier === 'mid_range' 
                  ? 'bg-forest-800 text-white font-semibold' 
                  : 'bg-ivory text-travel-muted hover:text-forest-800'
              }`}
            >
              Mid-Range
            </button>
            <button
              type="button"
              onClick={() => setBudgetTier('luxury')}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                budgetTier === 'luxury' 
                  ? 'bg-forest-800 text-white font-semibold' 
                  : 'bg-ivory text-travel-muted hover:text-forest-800'
              }`}
            >
              Luxury
            </button>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Destination Field */}
          <div className="p-3 rounded-xl bg-ivory border border-travel-border hover:border-forest-700/50 transition-colors">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-travel-muted flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-forest-700" />
              Where To?
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full bg-transparent font-medium text-forest-900 text-sm focus:outline-none cursor-pointer"
            >
              <option value="">Any Destination (All India)</option>
              {topPlaces.map((d) => (
                <option key={d.id} value={d.destination_name}>
                  {d.destination_name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Trip Duration */}
          <div className="p-3 rounded-xl bg-ivory border border-travel-border hover:border-forest-700/50 transition-colors">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-travel-muted flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-transparent font-medium text-forest-900 text-sm focus:outline-none cursor-pointer"
            >
              <option value="3">3 Days (Weekend Break)</option>
              <option value="5">5 Days (Standard Getaway)</option>
              <option value="7">7 Days (Full Explorer)</option>
              <option value="10">10 Days (Deep Journey)</option>
              <option value="14">14 Days (Grand Expedition)</option>
            </select>
          </div>

          {/* Travel Style */}
          <div className="p-3 rounded-xl bg-ivory border border-travel-border hover:border-forest-700/50 transition-colors">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-travel-muted flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5 text-forest-700" />
              Travel Style
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full bg-transparent font-medium text-forest-900 text-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Travel Styles</option>
              <option value="Beach">Beaches & Coastal</option>
              <option value="Mountain">Mountains & Serenity</option>
              <option value="Heritage">Heritage & Architecture</option>
              <option value="Adventure">Adventure & Trekking</option>
              <option value="Wildlife">Wildlife & Safaris</option>
              <option value="Spiritual">Spiritual & Wellness</option>
            </select>
          </div>

          {/* Budget Tier / Estimated Cost Display */}
          <div className="p-3 rounded-xl bg-ivory border border-travel-border flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-travel-muted flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-forest-700" />
                Est. Daily Budget
              </span>
              <p className="font-semibold text-forest-900 text-xs">
                {budgetTier === 'budget' && '₹1,400 – ₹2,800 / day'}
                {budgetTier === 'mid_range' && '₹3,300 – ₹6,600 / day'}
                {budgetTier === 'luxury' && '₹10,800 – ₹26,000 / day'}
              </p>
            </div>
            <span className="text-[10px] text-travel-muted mt-1">Per person all-inclusive</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-travel-border/60">
          <div className="flex items-center gap-2 text-xs text-travel-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dataset contains 100 destinations across 30 Indian states</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExploreSubmit}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-forest-800 text-forest-800 font-semibold text-xs hover:bg-forest-50 transition-colors"
            >
              Explore Matches
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs tracking-wide shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Build Day-by-Day Itinerary</span>
              <ArrowRight className="w-4 h-4 text-lime-accent" />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
