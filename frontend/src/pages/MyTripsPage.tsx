import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Trash2, ArrowRight, MapPin, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { apiClient } from '../lib/api-client';

export const MyTripsPage: React.FC = () => {
  const [savedTrips, setSavedTrips] = useState<any[]>(() => {
    const saved = localStorage.getItem('tb_saved_trips');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
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
      },
      {
        id: 'trip_default_02',
        destination: 'Goa',
        state: 'Goa',
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
        duration: 4,
        travelers: 2,
        budgetTier: 'budget',
        totalCost: 14800,
        created_at: '2026-10-15',
      }
    ];
  });

  // Fetch backend trips if authenticated
  useEffect(() => {
    const token = localStorage.getItem('tb_token');
    if (!token) return;

    apiClient.get<{ trips: any[]; count: number }>('/trips')
      .then(res => {
        if (res && Array.isArray(res.trips) && res.trips.length > 0) {
          const formatted = res.trips.map(t => ({
            id: t.id,
            destination: t.destination_name,
            state: t.state,
            image_url: t.image_url,
            duration: t.duration_days,
            travelers: t.traveler_count,
            budgetTier: t.budget_tier,
            totalCost: t.estimated_cost_inr || t.total_budget_inr,
            created_at: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent',
            days: t.days,
          }));
          setSavedTrips(formatted);
          localStorage.setItem('tb_saved_trips', JSON.stringify(formatted));
        }
      })
      .catch(err => {
        console.warn('Trips API fetch fallback to local cache:', err);
      });
  }, []);

  const handleDeleteTrip = async (tripId: string) => {
    const updated = savedTrips.filter(t => t.id !== tripId);
    setSavedTrips(updated);
    localStorage.setItem('tb_saved_trips', JSON.stringify(updated));

    const token = localStorage.getItem('tb_token');
    if (token && !tripId.startsWith('trip_default')) {
      try {
        await apiClient.delete(`/trips/${tripId}`);
      } catch (err) {
        console.warn('Failed to delete trip on server:', err);
      }
    }
  };

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-forest-700" />
              <span>Itinerary Archive</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
              My Trips & Saved Itineraries ({savedTrips.length})
            </h1>
            <p className="text-travel-muted text-sm mt-1 max-w-xl">
              All your custom generated travel itineraries, budgets, and day-by-day plans.
            </p>
          </div>

          <Link
            to="/plan-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Trip</span>
          </Link>
        </div>

        {savedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-3xl border border-travel-border overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
                <div className="aspect-[16/10] relative">
                  <img
                    src={trip.image_url}
                    alt={trip.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <h3 className="font-serif text-xl font-bold">{trip.destination}</h3>
                      <p className="text-xs text-ivory-muted/90">{trip.state} · {trip.duration} Days</p>
                    </div>
                    <span className="text-xs font-bold text-lime-accent">
                      {formatCurrency(trip.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-ivory border border-travel-border">
                      <span className="text-travel-muted text-[10px] block">Travelers</span>
                      <strong className="text-forest-900">{trip.travelers} Persons</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-ivory border border-travel-border">
                      <span className="text-travel-muted text-[10px] block">Budget Tier</span>
                      <strong className="text-forest-900 capitalize">{trip.budgetTier?.replace('_', '-')}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-travel-border flex items-center justify-between">
                    <Link
                      to={`/plan-trip?dest=${encodeURIComponent(trip.destination)}&days=${trip.duration}&tier=${trip.budgetTier}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 group"
                    >
                      <span>Open Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-travel-border p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-900">No Trips Created Yet</h3>
            <p className="text-xs text-travel-muted">
              Use our guided smart trip planner to construct customized itineraries with day-by-day schedules.
            </p>
            <Link
              to="/plan-trip"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan Your First Trip</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
