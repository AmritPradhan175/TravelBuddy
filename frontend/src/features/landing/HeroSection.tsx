import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, MapPin, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { TripPlannerPanel } from '../../components/shared/TripPlannerPanel';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-ivory">
      
      {/* Editorial Decorative Background Orbs & Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-forest-100/60 via-lime-soft/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-[-100px] w-96 h-96 rounded-full bg-forest-700/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-travel-border shadow-xs text-xs font-semibold text-forest-800">
            <span className="w-2 h-2 rounded-full bg-lime-accent" />
            <span className="tracking-wide">AI-POWERED TOURISM INTELLIGENCE</span>
            <span className="text-travel-muted">·</span>
            <span className="text-forest-700 font-medium">100 Hand-Curated Destinations</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-14">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-forest-900 tracking-tight leading-[1.08] mb-6">
            The world is yours <br />
            <span className="italic font-light text-forest-700">to discover.</span>
          </h1>

          <p className="text-base sm:text-xl text-travel-muted max-w-2xl mx-auto leading-relaxed font-sans">
            Discover extraordinary places, plan personalized journeys, and make every trip your own with data-driven itineraries, real local costs, and machine learning recommendations.
          </p>

          {/* Quick Hero Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/plan-trip"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-sm shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-lime-accent" />
              <span>Plan My Trip</span>
            </Link>

            <Link
              to="/manual-planner"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-forest-50 text-forest-800 border border-travel-border font-semibold text-sm shadow-xs transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-forest-700" />
              <span>Build My Own Trip</span>
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-semibold text-travel-muted hover:text-forest-900 transition-colors"
            >
              <span>Explore 100 Places</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Cinematic Preview & Trip Planning Search Panel */}
        <div className="relative mt-6 z-10">
          <TripPlannerPanel />
        </div>

        {/* Trust & Dataset Indicators Below Search */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-travel-border/80">
            <span className="font-serif text-2xl font-bold text-forest-900 block">100</span>
            <span className="text-xs text-travel-muted">Iconic & Hidden Places</span>
          </div>
          <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-travel-border/80">
            <span className="font-serif text-2xl font-bold text-forest-900 block">30</span>
            <span className="text-xs text-travel-muted">States & Territories</span>
          </div>
          <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-travel-border/80">
            <span className="font-serif text-2xl font-bold text-forest-900 block">3 Tiers</span>
            <span className="text-xs text-travel-muted">Budget, Mid & Luxury</span>
          </div>
          <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-travel-border/80">
            <span className="font-serif text-2xl font-bold text-forest-900 block">100%</span>
            <span className="text-xs text-travel-muted">Verified Local Sights</span>
          </div>
        </div>

      </div>
    </section>
  );
};
