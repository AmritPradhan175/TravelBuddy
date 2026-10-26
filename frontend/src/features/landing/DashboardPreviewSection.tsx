import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bookmark, History, Sparkles, MapPin, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardPreviewSection: React.FC = () => {
  const { user, favorites } = useAuth();

  return (
    <section className="py-20 bg-white border-t border-travel-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5 text-forest-700" />
            <span>Personal Command Center</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-forest-900 tracking-tight">
            Your travel journeys, organized in one place.
          </h2>
          <p className="text-travel-muted text-sm sm:text-base mt-2">
            A comprehensive travel dashboard with saved itineraries, persistent browsing history, and tailored machine learning recommendations.
          </p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="max-w-5xl mx-auto bg-ivory rounded-3xl border border-travel-border shadow-elevated p-6 md:p-8">
          
          {/* Top User Welcome Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-travel-border gap-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                alt="User Avatar"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
              />
              <div>
                <h3 className="font-serif text-2xl font-bold text-forest-900">
                  Welcome back, {user?.full_name.split(' ')[0] || 'Traveler'}
                </h3>
                <p className="text-xs text-travel-muted">
                  Home Base: {user?.home_city || 'Bengaluru'} · Travel style: Nature & Heritage · INR (₹)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/plan-trip"
                className="px-4 py-2 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors shadow-xs"
              >
                + New Trip
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-full bg-white border border-travel-border text-forest-800 text-xs font-semibold hover:bg-forest-50 transition-colors"
              >
                View Full Dashboard
              </Link>
            </div>
          </div>

          {/* Dashboard Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="p-4 rounded-xl bg-white border border-travel-border">
              <span className="text-[11px] uppercase tracking-wider text-travel-muted font-medium block">
                Saved Destinations
              </span>
              <span className="font-serif text-2xl font-bold text-forest-900 mt-1 block">
                {favorites.length}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">In your bucket list</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-travel-border">
              <span className="text-[11px] uppercase tracking-wider text-travel-muted font-medium block">
                Planned Itineraries
              </span>
              <span className="font-serif text-2xl font-bold text-forest-900 mt-1 block">
                3
              </span>
              <span className="text-[10px] text-travel-muted font-medium">1 Upcoming · 2 Saved</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-travel-border">
              <span className="text-[11px] uppercase tracking-wider text-travel-muted font-medium block">
                Travel Styles
              </span>
              <span className="font-serif text-2xl font-bold text-forest-900 mt-1 block">
                3
              </span>
              <span className="text-[10px] text-travel-muted font-medium">Nature, Heritage, Beach</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-travel-border">
              <span className="text-[11px] uppercase tracking-wider text-travel-muted font-medium block">
                ML Matches
              </span>
              <span className="font-serif text-2xl font-bold text-forest-900 mt-1 block">
                12
              </span>
              <span className="text-[10px] text-lime-600 font-semibold">Ready for review</span>
            </div>
          </div>

          {/* Active Trip Spotlight inside Dashboard */}
          <div className="bg-white rounded-2xl border border-travel-border p-5 md:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-accent text-forest-900">
                  UPCOMING JOURNEY
                </span>
                <span className="text-xs text-travel-muted font-medium">Nov 14 – Nov 18 · 5 Days</span>
              </div>
              <Link to="/my-trips" className="text-xs font-semibold text-forest-800 hover:underline flex items-center gap-1">
                <span>Manage Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 aspect-[16/10] rounded-xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80"
                  alt="Ladakh Leh"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 text-white">
                  <p className="font-serif text-base font-bold">Ladakh (Leh)</p>
                  <p className="text-[10px] text-white/80">North India · Altitude 3,500m</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-ivory border border-travel-border">
                    <span className="text-travel-muted text-[10px] block">Travelers</span>
                    <span className="font-semibold text-forest-900">2 Adults</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-ivory border border-travel-border">
                    <span className="text-travel-muted text-[10px] block">Budget Tier</span>
                    <span className="font-semibold text-forest-900">Mid-Range</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-ivory border border-travel-border">
                    <span className="text-travel-muted text-[10px] block">Est. Budget</span>
                    <span className="font-semibold text-forest-900">₹32,500</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-travel-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Day 1: Acclimatization, Leh Market & Shanti Stupa sunset</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Day 2: Hemis & Thiksey Monasteries, Indus valley view</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                    <span>Day 3: Khardung La Pass crossing to Nubra Valley sand dunes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
