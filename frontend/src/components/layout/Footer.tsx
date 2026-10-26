import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Heart, Globe, Shield, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-900 text-ivory-muted border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                TravelBuddy
              </span>
            </div>
            <p className="text-sm text-ivory-muted/80 max-w-sm leading-relaxed">
              "The world is yours to discover." Intelligent tourism discovery, personalized machine learning recommendations, and day-by-day itinerary planning.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-lime-accent font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Next-Generation Travel Planning</span>
            </div>
            <div className="text-xs text-ivory-muted/70 flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-full bg-forest-800/80 text-ivory-muted border border-forest-700/60">✨ Smart Itineraries</span>
              <span className="px-2.5 py-1 rounded-full bg-forest-800/80 text-ivory-muted border border-forest-700/60">🧭 100 Indian Destinations</span>
              <span className="px-2.5 py-1 rounded-full bg-forest-800/80 text-ivory-muted border border-forest-700/60">⚡ Real Local Budgets</span>
            </div>
          </div>

          {/* Discovery Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white/90">
              Discover
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore?category=Beach" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Beaches & Coastal
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Mountain" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Himalayan & Mountains
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Heritage" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Heritage & Forts
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Wildlife" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Wildlife & National Parks
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Spiritual" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Spiritual & Sacred Sites
                </Link>
              </li>
              <li>
                <Link to="/explore?sort=popularity" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Top 20 Trending Destinations
                </Link>
              </li>
            </ul>
          </div>

          {/* Plan & Intelligent Tools */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white/90">
              Planning Tools
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/plan-trip" className="text-ivory-muted/70 hover:text-lime-accent transition-colors flex items-center gap-1.5">
                  Smart Trip Planner
                  <span className="text-[10px] px-1.5 py-0.2 bg-lime-accent text-forest-900 rounded font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  AI Travel Assistant
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Personal Travel Dashboard
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Saved Bucket List
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  Browsing History
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Trust */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white/90">
              Platform & Data
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-ivory-muted/70 hover:text-lime-accent transition-colors">
                  About TravelBuddy
                </Link>
              </li>
              <li>
                <span className="text-ivory-muted/60 text-xs block leading-relaxed">
                  Curated across 30 Indian states with verified seasonal windows, local transport logistics, and multi-tier pricing benchmarks.
                </span>
              </li>
              <li className="pt-2">
                <div className="p-3 rounded-lg bg-forest-800/50 border border-forest-700/60 text-xs">
                  <div className="flex items-center gap-1.5 text-lime-accent font-semibold mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    Verified Cost Estimates
                  </div>
                  <p className="text-ivory-muted/70 text-[11px] leading-relaxed">
                    Estimates are calculated from verified local benchmarks in INR with budget, mid-range, and luxury tiers.
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-muted/60 gap-4">
          <p>© {new Date().getFullYear()} TravelBuddy Inc. All rights reserved. The world is yours to discover.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Overview</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
