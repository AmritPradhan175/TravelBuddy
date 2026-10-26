import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  Bot, 
  Compass, 
  MoveUp, 
  MoveDown,
  Train,
  Plane,
  Hotel,
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { destinationsData, type Destination } from '../data/destinations';
import { formatCurrency, ensureArray } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import { BookingModal } from '../components/shared/BookingModal';

interface ManualActivity {
  id: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  locationNotes: string;
  estimatedCost: number;
}

interface ManualDay {
  dayNumber: number;
  dateStr?: string;
  title: string;
  accommodationCost: number;
  transportCost: number;
  activities: ManualActivity[];
}

export const ManualPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialDestName = searchParams.get('dest') || 'Goa';
  const initialDays = Number(searchParams.get('days')) || 3;

  const [tripTitle, setTripTitle] = useState(`My Custom Expedition to ${initialDestName}`);
  const [selectedDestName, setSelectedDestName] = useState(initialDestName);
  const [travelers, setTravelers] = useState(2);
  const [targetBudget, setTargetBudget] = useState(25000);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const matchedDest = destinationsData.find(
    d => d.destination_name.toLowerCase() === selectedDestName.toLowerCase()
  ) || destinationsData[0];

  // Initialize days
  const [days, setDays] = useState<ManualDay[]>(() => {
    const initialList: ManualDay[] = [];
    for (let i = 1; i <= initialDays; i++) {
      initialList.push({
        dayNumber: i,
        title: i === 1 ? 'Arrival & Neighborhood Walk' : `Exploration & Culture Day ${i}`,
        accommodationCost: 2200,
        transportCost: 600,
        activities: [
          {
            id: `act_${i}_1`,
            timeSlot: 'Morning',
            title: i === 1 ? 'Check-in & Settle Down' : 'Sightseeing & Photography',
            locationNotes: 'Main center or landmark',
            estimatedCost: 350,
          },
          {
            id: `act_${i}_2`,
            timeSlot: 'Afternoon',
            title: 'Authentic Regional Lunch & Walk',
            locationNotes: 'Local market or heritage lane',
            estimatedCost: 600,
          },
          {
            id: `act_${i}_3`,
            timeSlot: 'Evening',
            title: 'Sunset Views & Dining',
            locationNotes: 'Scenic viewpoint or promenade',
            estimatedCost: 800,
          }
        ]
      });
    }
    return initialList;
  });

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // AI Suggestions Drawer
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate live financial tally
  const totalActivitiesCost = days.reduce(
    (sum, d) => sum + d.activities.reduce((aSum, a) => aSum + a.estimatedCost, 0),
    0
  );
  const totalAccommodationCost = days.reduce((sum, d) => sum + d.accommodationCost, 0);
  const totalTransportCost = days.reduce((sum, d) => sum + d.transportCost, 0);

  const grandTotalCost = (totalActivitiesCost + totalAccommodationCost + totalTransportCost) * (travelers > 1 ? (travelers * 0.75) : 1);
  const remainingBudget = targetBudget - grandTotalCost;
  const isOverBudget = remainingBudget < 0;

  // Day handlers
  const handleAddDay = () => {
    const nextNum = days.length + 1;
    setDays(prev => [
      ...prev,
      {
        dayNumber: nextNum,
        title: `Custom Itinerary Day ${nextNum}`,
        accommodationCost: 2000,
        transportCost: 500,
        activities: [
          {
            id: `act_${nextNum}_${Date.now()}`,
            timeSlot: 'Morning',
            title: 'Morning Exploration',
            locationNotes: 'Local highlight',
            estimatedCost: 400,
          }
        ]
      }
    ]);
  };

  const handleRemoveDay = (dayNum: number) => {
    if (days.length <= 1) return;
    const filtered = days.filter(d => d.dayNumber !== dayNum);
    // Renumber
    const renumbered = filtered.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    setDays(renumbered);
  };

  // Activity handlers
  const handleAddActivity = (dayIndex: number) => {
    const newAct: ManualActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timeSlot: 'Afternoon',
      title: 'New Custom Experience',
      locationNotes: 'Add location or notes',
      estimatedCost: 500,
    };

    setDays(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        activities: [...copy[dayIndex].activities, newAct],
      };
      return copy;
    });
  };

  const handleUpdateActivity = (dayIndex: number, actId: string, updates: Partial<ManualActivity>) => {
    setDays(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        activities: copy[dayIndex].activities.map(a => a.id === actId ? { ...a, ...updates } : a)
      };
      return copy;
    });
  };

  const handleDeleteActivity = (dayIndex: number, actId: string) => {
    setDays(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        activities: copy[dayIndex].activities.filter(a => a.id !== actId)
      };
      return copy;
    });
  };

  const handleMoveActivity = (dayIndex: number, actIndex: number, direction: 'up' | 'down') => {
    setDays(prev => {
      const copy = [...prev];
      const acts = [...copy[dayIndex].activities];
      const targetIndex = direction === 'up' ? actIndex - 1 : actIndex + 1;
      if (targetIndex < 0 || targetIndex >= acts.length) return prev;
      
      const temp = acts[actIndex];
      acts[actIndex] = acts[targetIndex];
      acts[targetIndex] = temp;

      copy[dayIndex] = { ...copy[dayIndex], activities: acts };
      return copy;
    });
  };

  // AI Suggestions
  const handleAskAIAdvice = async () => {
    setAiSuggestionsOpen(true);
    setAiLoading(true);
    try {
      const summaryMsg = `I am manually designing a ${days.length}-day trip to ${selectedDestName} for ${travelers} travelers with a budget of ₹${targetBudget.toLocaleString()}. Can you review this pacing and suggest any must-visit sights or cost-saving improvements?`;
      const res = await apiClient.post<{ text: string }>('/assistant/chat', { message: summaryMsg });
      if (res && res.text) {
        setAiAdvice(res.text);
      } else {
        setAiAdvice(`For ${selectedDestName}, consider clustering sights geographically to minimize cab transit. The dataset suggests checking out ${ensureArray(matchedDest.primary_attractions).slice(0, 3).join(', ')}.`);
      }
    } catch {
      setAiAdvice(`Expert Tip for ${selectedDestName}: Peak season is ${matchedDest.peak_tourist_season}. Ensure hotel reservations are confirmed ahead to stay within your ₹${targetBudget.toLocaleString()} allocation.`);
    } finally {
      setAiLoading(false);
    }
  };

  // Save Trip
  const handleSaveTrip = async () => {
    setIsSaving(true);
    const tripPayload = {
      destination_id: matchedDest.id,
      destination_name: matchedDest.destination_name,
      state: matchedDest.state,
      image_url: matchedDest.image_url,
      title: tripTitle,
      duration_days: days.length,
      traveler_count: travelers,
      travel_style: 'Custom Manual',
      budget_tier: grandTotalCost > 35000 ? 'luxury' : grandTotalCost > 15000 ? 'mid_range' : 'budget',
      total_budget_inr: targetBudget,
      estimated_cost_inr: Math.round(grandTotalCost),
      days: days.map(d => ({
        day_number: d.dayNumber,
        theme: d.title,
        day_notes: `Accommodation: ₹${d.accommodationCost} · Transport: ₹${d.transportCost}`,
        activities: d.activities.map(a => ({
          time_slot: a.timeSlot,
          title: a.title,
          description: a.locationNotes,
          cost_inr: a.estimatedCost
        }))
      }))
    };

    let tripId = `trip_manual_${Date.now()}`;
    const token = localStorage.getItem('tb_token');
    if (token) {
      try {
        const res = await apiClient.post<{ trip: { id: string } }>('/trips', tripPayload);
        if (res && res.trip && res.trip.id) {
          tripId = res.trip.id;
        }
      } catch (e) {
        console.warn('Backend save fallback:', e);
      }
    }

    // Save locally
    const saved = {
      id: tripId,
      destination: matchedDest.destination_name,
      state: matchedDest.state,
      image_url: matchedDest.image_url,
      duration: days.length,
      travelers,
      budgetTier: 'mid_range',
      totalCost: Math.round(grandTotalCost),
      created_at: new Date().toLocaleDateString(),
      days,
    };
    const existing = JSON.parse(localStorage.getItem('tb_saved_trips') || '[]');
    localStorage.setItem('tb_saved_trips', JSON.stringify([saved, ...existing]));

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Manual Trip Builder</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
              Build Your Own Trip From Scratch
            </h1>
            <p className="text-travel-muted text-xs sm:text-sm mt-1">
              Construct an authentic itinerary day-by-day, customize activities, calculate costs in real-time, and get AI suggestions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAskAIAdvice}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-travel-border hover:border-forest-700 text-forest-800 text-xs font-semibold shadow-xs transition-all"
            >
              <Bot className="w-4 h-4 text-forest-700" />
              <span>Ask AI Suggestions</span>
            </button>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold hover:bg-forest-100 transition-colors"
            >
              <Train className="w-4 h-4 text-forest-700" />
              <span>Booking Options</span>
            </button>

            <button
              onClick={handleSaveTrip}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved to Archive!' : 'Save Itinerary'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Trip saved successfully!</strong> View it anytime in your personal dashboard or itinerary archive.</span>
            </div>
            <Link to="/my-trips" className="font-bold underline hover:text-emerald-900">
              Go to My Trips →
            </Link>
          </div>
        )}

        {/* Trip Configuration Grid */}
        <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] uppercase font-bold text-travel-muted tracking-wider block">
              Trip Title
            </label>
            <input
              type="text"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-travel-muted tracking-wider block">
              Destination
            </label>
            <select
              value={selectedDestName}
              onChange={(e) => setSelectedDestName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
            >
              {destinationsData.map(d => (
                <option key={d.id} value={d.destination_name}>
                  {d.destination_name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-travel-muted tracking-wider block">
              Party Size
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
            >
              {[1, 2, 3, 4, 5, 6, 8].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-travel-muted tracking-wider block">
              Target Budget (INR)
            </label>
            <input
              type="number"
              step="1000"
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
          </div>
        </div>

        {/* Live Budget Status Tracker */}
        <div className="bg-white rounded-3xl border border-travel-border p-5 shadow-card grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-2xl bg-ivory border border-travel-border">
            <span className="text-[10px] uppercase font-bold text-travel-muted block">Activities Total</span>
            <strong className="font-serif text-lg text-forest-900">{formatCurrency(totalActivitiesCost)}</strong>
          </div>
          <div className="p-3 rounded-2xl bg-ivory border border-travel-border">
            <span className="text-[10px] uppercase font-bold text-travel-muted block">Stay & Transit</span>
            <strong className="font-serif text-lg text-forest-900">{formatCurrency(totalAccommodationCost + totalTransportCost)}</strong>
          </div>
          <div className="p-3 rounded-2xl bg-ivory border border-travel-border">
            <span className="text-[10px] uppercase font-bold text-travel-muted block">Grand Estimated Cost</span>
            <strong className="font-serif text-lg text-forest-900">{formatCurrency(grandTotalCost)}</strong>
          </div>
          <div className={`p-3 rounded-2xl border ${isOverBudget ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <span className="text-[10px] uppercase font-bold block">{isOverBudget ? 'Over Budget' : 'Remaining Budget'}</span>
            <strong className="font-serif text-lg">{formatCurrency(Math.abs(remainingBudget))}</strong>
          </div>
        </div>

        {/* Day-by-Day Interactive Schedule */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-forest-900">
              Daily Itinerary Breakdown ({days.length} Days)
            </h2>
            <button
              onClick={handleAddDay}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Next Day</span>
            </button>
          </div>

          <div className="space-y-6">
            {days.map((day, dIdx) => (
              <div key={day.dayNumber} className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
                
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-travel-border gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-forest-800 text-lime-accent flex items-center justify-center font-bold text-xs">
                      {day.dayNumber}
                    </span>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDays(prev => {
                          const copy = [...prev];
                          copy[dIdx].title = val;
                          return copy;
                        });
                      }}
                      className="font-serif text-lg font-bold text-forest-900 bg-transparent border-b border-transparent hover:border-travel-border focus:border-forest-700 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-travel-muted">Stay (₹):</span>
                      <input
                        type="number"
                        step="100"
                        value={day.accommodationCost}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDays(prev => {
                            const copy = [...prev];
                            copy[dIdx].accommodationCost = val;
                            return copy;
                          });
                        }}
                        className="w-20 px-2 py-1 rounded-lg border border-travel-border bg-ivory text-xs font-semibold text-right"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-travel-muted">Cab/Transit (₹):</span>
                      <input
                        type="number"
                        step="50"
                        value={day.transportCost}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDays(prev => {
                            const copy = [...prev];
                            copy[dIdx].transportCost = val;
                            return copy;
                          });
                        }}
                        className="w-20 px-2 py-1 rounded-lg border border-travel-border bg-ivory text-xs font-semibold text-right"
                      />
                    </div>

                    {days.length > 1 && (
                      <button
                        onClick={() => handleRemoveDay(day.dayNumber)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-3">
                  {day.activities.map((act, aIdx) => (
                    <div key={act.id} className="p-3.5 rounded-2xl bg-ivory/60 border border-travel-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      
                      <div className="flex items-center gap-2.5 flex-1">
                        <select
                          value={act.timeSlot}
                          onChange={(e) => handleUpdateActivity(dIdx, act.id, { timeSlot: e.target.value as any })}
                          className="px-2.5 py-1 rounded-lg border border-travel-border bg-white text-[11px] font-semibold text-forest-800"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                        </select>

                        <input
                          type="text"
                          value={act.title}
                          onChange={(e) => handleUpdateActivity(dIdx, act.id, { title: e.target.value })}
                          placeholder="Activity name (e.g. Visit Fort Aguada)"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-travel-border bg-white text-xs font-semibold text-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-700"
                        />
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <input
                          type="text"
                          value={act.locationNotes}
                          onChange={(e) => handleUpdateActivity(dIdx, act.id, { locationNotes: e.target.value })}
                          placeholder="Notes or Landmark"
                          className="w-40 px-2.5 py-1.5 rounded-lg border border-travel-border bg-white text-[11px] text-travel-muted"
                        />

                        <div className="flex items-center gap-1">
                          <span className="text-travel-muted">₹</span>
                          <input
                            type="number"
                            step="50"
                            value={act.estimatedCost}
                            onChange={(e) => handleUpdateActivity(dIdx, act.id, { estimatedCost: Number(e.target.value) })}
                            className="w-16 px-2 py-1 rounded-lg border border-travel-border bg-white text-xs font-semibold text-right"
                          />
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleMoveActivity(dIdx, aIdx, 'up')}
                            disabled={aIdx === 0}
                            className="p-1 text-travel-muted hover:text-forest-900 disabled:opacity-30"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveActivity(dIdx, aIdx, 'down')}
                            disabled={aIdx === day.activities.length - 1}
                            className="p-1 text-travel-muted hover:text-forest-900 disabled:opacity-30"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteActivity(dIdx, act.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}

                  <button
                    onClick={() => handleAddActivity(dIdx)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-900 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add activity to Day {day.dayNumber}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Booking Options Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        destination={matchedDest}
        startDate={startDate}
        travelers={travelers}
      />

      {/* AI Advice Drawer */}
      {aiSuggestionsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-forest-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-travel-border mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-forest-700" />
                  <h3 className="font-serif text-lg font-bold text-forest-900">AI Itinerary Review</h3>
                </div>
                <button
                  onClick={() => setAiSuggestionsOpen(false)}
                  className="p-1 text-travel-muted hover:text-forest-900"
                >
                  ✕
                </button>
              </div>

              {aiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-forest-800 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-travel-muted">Analyzing destination pacing, local costs & transit...</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs leading-relaxed text-travel-text whitespace-pre-line">
                  <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-100 text-forest-900">
                    <strong>Grounded Knowledge Context:</strong>
                    <p className="mt-1">
                      {matchedDest.destination_name} ({matchedDest.state}) has a safety rating of {matchedDest.safety_rating}/10 and an ideal duration of {matchedDest.ideal_days} days.
                    </p>
                  </div>
                  <div>{aiAdvice}</div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-travel-border">
              <button
                onClick={() => setAiSuggestionsOpen(false)}
                className="w-full py-2.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold"
              >
                Apply Insights to Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
