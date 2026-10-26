import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Gem, Mountain, Sun, Landmark } from 'lucide-react';
import { destinationsData, type Destination } from '../../data/destinations';
import { DestinationCard } from '../../components/shared/DestinationCard';

export const CuratedSections: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'gems' | 'nature' | 'beaches' | 'culture'>('trending');

  // Category datasets filtered from authentic records
  const trending = destinationsData
    .filter(d => d.popularity_score >= 8)
    .slice(0, 6);

  const hiddenGems = destinationsData
    .filter(d => (d.popularity_score <= 7 && d.popularity_score >= 5) || d.destination_name.includes('Valley') || d.destination_name.includes('Mawlynnong') || d.destination_name.includes('Khajjiar'))
    .slice(0, 6);

  const natureAdventure = destinationsData
    .filter(d => {
      const types = JSON.stringify(d.trip_types).toLowerCase();
      return types.includes('adventure') || types.includes('nature') || types.includes('trekking') || types.includes('mountain');
    })
    .slice(0, 6);

  const beaches = destinationsData
    .filter(d => {
      const types = JSON.stringify(d.trip_types).toLowerCase();
      return types.includes('beach') || d.state === 'Goa' || d.state === 'Kerala';
    })
    .slice(0, 6);

  const cultureHeritage = destinationsData
    .filter(d => {
      const types = JSON.stringify(d.trip_types).toLowerCase();
      return types.includes('cultural') || types.includes('heritage') || types.includes('religious');
    })
    .slice(0, 6);

  const getActiveList = (): Destination[] => {
    switch (activeTab) {
      case 'trending': return trending;
      case 'gems': return hiddenGems;
      case 'nature': return natureAdventure;
      case 'beaches': return beaches;
      case 'culture': return cultureHeritage;
      default: return trending;
    }
  };

  const tabs = [
    { id: 'trending', label: 'Trending Places', icon: Flame, badge: 'Popular' },
    { id: 'gems', label: 'Hidden Gems', icon: Gem, badge: 'Rare Finds' },
    { id: 'nature', label: 'Mountains & Nature', icon: Mountain, badge: 'Adventure' },
    { id: 'beaches', label: 'Coastal & Beaches', icon: Sun, badge: 'Relax' },
    { id: 'culture', label: 'Heritage & Culture', icon: Landmark, badge: 'Historic' },
  ] as const;

  return (
    <section className="py-20 bg-ivory border-t border-travel-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700 mb-2">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>Curated Destination Discovery</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-forest-900 tracking-tight">
              Explore by what moves you.
            </h2>
            <p className="text-travel-muted text-sm sm:text-base mt-2 max-w-xl">
              Filter through authentic Indian destinations with comprehensive budgets, regional attractions, and verified seasons.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 hover:text-forest-900 group"
          >
            <span>View all 100 destinations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'bg-white border border-travel-border text-travel-text hover:bg-forest-50 hover:text-forest-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-lime-accent' : 'text-travel-muted'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-forest-700 text-lime-accent' : 'bg-ivory text-travel-muted'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {getActiveList().map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>

        {/* Bottom Explore Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-forest-900 to-forest-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-xl sm:text-2xl text-lime-accent font-semibold">
              Looking for something specific?
            </h4>
            <p className="text-xs sm:text-sm text-ivory-muted/80 max-w-lg">
              Search by state, airport proximity, safety ratings, weather patterns, or local cuisines.
            </p>
          </div>
          <Link
            to="/explore"
            className="px-6 py-3 rounded-full bg-lime-accent text-forest-900 font-semibold text-xs tracking-wide hover:bg-lime-hover shadow-sm transition-all"
          >
            Launch Full Explorer
          </Link>
        </div>

      </div>
    </section>
  );
};
