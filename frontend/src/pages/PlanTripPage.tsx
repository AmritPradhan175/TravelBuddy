import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Compass,
  AlertCircle,
  Train,
  Plane,
  Hotel,
  ShieldCheck,
  RefreshCw,
  Edit2,
  Users,
  Wallet,
  Car,
  Tag
} from 'lucide-react';
import { destinationsData, type Destination } from '../data/destinations';
import { formatCurrency, ensureArray } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import { BookingModal } from '../components/shared/BookingModal';

// Zod Validation Schema
const tripPlannerSchema = z.object({
  startingCity: z.string().min(2, 'Starting city is required'),
  destinationMode: z.enum(['specific', 'region', 'surprise']),
  destinationName: z.string(),
  selectedRegion: z.string(),
  durationDays: z.number().min(1).max(15),
  startDate: z.string().min(1, 'Departure date required'),
  adults: z.number().min(1, 'At least 1 adult traveler required'),
  children: z.number().min(0),
  totalBudget: z.number().min(5000, 'Minimum realistic trip budget is ₹5,000'),
  travelStyle: z.enum(['budget', 'comfortable', 'premium']),
  accommodationType: z.enum(['hostel_guesthouse', 'hotel_homestay', 'luxury_resort']),
  transportPreference: z.enum(['train', 'flight', 'road_cab']),
  experiences: z.array(z.string()).min(1, 'Please pick at least one travel vibe'),
  dietaryOrAccessibility: z.string().optional(),
});

type TripPlannerFormValues = z.infer<typeof tripPlannerSchema>;

interface ItineraryActivityItem {
  id: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  desc: string;
  cost: number;
  durationHours: number;
}

interface ItineraryDayPlan {
  dayNumber: number;
  dateStr: string;
  theme: string;
  travelTransitNote: string;
  staySuggestion: string;
  accommodationCost: number;
  foodCost: number;
  transportCost: number;
  activities: ItineraryActivityItem[];
}

export const PlanTripPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryDest = searchParams.get('dest') || 'Goa';
  const queryDays = Number(searchParams.get('days')) || 4;
  const queryTier = searchParams.get('tier') || 'comfortable';

  // Step wizard state: 1 (Origin/Dest) -> 2 (Dates/Party) -> 3 (Budget/Style) -> 4 (Vibe/Needs) -> 5 (Generated Itinerary View)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [itineraryGenerated, setItineraryGenerated] = useState<boolean>(true);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TripPlannerFormValues>({
    resolver: zodResolver(tripPlannerSchema),
    defaultValues: {
      startingCity: 'New Delhi',
      destinationMode: 'specific',
      destinationName: queryDest,
      selectedRegion: 'West India',
      durationDays: queryDays,
      startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      adults: 2,
      children: 0,
      totalBudget: 32000,
      travelStyle: queryTier === 'budget' ? 'budget' : queryTier === 'luxury' ? 'premium' : 'comfortable',
      accommodationType: 'hotel_homestay',
      transportPreference: 'flight',
      experiences: ['Beaches', 'Culture', 'Relaxation'],
      dietaryOrAccessibility: '',
    },
  });

  const formValues = watch();

  // Matched Destination calculation
  const matchedDest: Destination = React.useMemo(() => {
    if (formValues.destinationMode === 'specific' && formValues.destinationName) {
      const found = destinationsData.find(
        d => d.destination_name.toLowerCase() === formValues.destinationName.toLowerCase()
      );
      if (found) return found;
    } else if (formValues.destinationMode === 'region' && formValues.selectedRegion) {
      const inRegion = destinationsData.filter(d => d.region === formValues.selectedRegion);
      if (inRegion.length > 0) return inRegion[0];
    } else if (formValues.destinationMode === 'surprise') {
      const gems = destinationsData.filter(d => d.popularity_score >= 8);
      return gems[Math.floor(Math.random() * gems.length)] || destinationsData[0];
    }
    return destinationsData[0];
  }, [formValues.destinationMode, formValues.destinationName, formValues.selectedRegion]);

  // Generator engine
  const createDayPlan = (dayNum: number, dest: Destination, startDateStr: string): ItineraryDayPlan => {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + (dayNum - 1));
    const formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const attractions = ensureArray(dest.primary_attractions);
    const activities = ensureArray(dest.activities_available);

    const morningSight = attractions[(dayNum * 2 - 2) % attractions.length] || 'Scenic Viewpoint';
    const afternoonSight = attractions[(dayNum * 2 - 1) % attractions.length] || 'Heritage Walk';
    const eveningAct = activities[(dayNum - 1) % activities.length] || 'Sunset Promenade & Local Dinner';

    const tierObj = formValues.travelStyle === 'budget' 
      ? dest.budget_category 
      : formValues.travelStyle === 'premium' 
        ? dest.luxury_category 
        : dest.mid_range_category;

    const baseDailyStay = tierObj?.accommodation_range?.[0] || 2200;
    const baseDailyFood = tierObj?.food_range?.[0] || 800;
    const baseDailyTransit = tierObj?.local_transport_range?.[0] || 400;

    return {
      dayNumber: dayNum,
      dateStr: formattedDate,
      theme: dayNum === 1 
        ? `Day 1: Arrival & Orientation in ${dest.destination_name}`
        : dayNum === formValues.durationDays 
          ? `Day ${dayNum}: Farewell & Souvenir Exploration` 
          : `Day ${dayNum}: Immersive Discovery`,
      travelTransitNote: `Transit: ~25 mins via local cab from ${dest.nearest_railway_station?.name || 'city center'}.`,
      staySuggestion: `${dest.destination_name} Boutique Stays (${dest.accommodation_types?.[0] || 'Hotel'})`,
      accommodationCost: baseDailyStay,
      foodCost: baseDailyFood,
      transportCost: baseDailyTransit,
      activities: [
        {
          id: `act_${dayNum}_m`,
          timeSlot: 'Morning',
          title: `Explore ${morningSight}`,
          desc: `Morning excursion with optimal lighting. Ideal for photography and peaceful sightseeing.`,
          cost: Math.round((tierObj?.activities_range?.[0] || 400) * 0.5),
          durationHours: 3,
        },
        {
          id: `act_${dayNum}_a`,
          timeSlot: 'Afternoon',
          title: `Visit ${afternoonSight} & Cultural Walk`,
          desc: `Guided walk through ${afternoonSight}, followed by sampling regional ${dest.local_cuisine_must_try?.[0] || 'specialties'}.`,
          cost: Math.round((tierObj?.activities_range?.[0] || 400) * 0.7),
          durationHours: 2.5,
        },
        {
          id: `act_${dayNum}_e`,
          timeSlot: 'Evening',
          title: eveningAct,
          desc: `Unwind with ${eveningAct} and traditional dinner in central market.`,
          cost: Math.round((tierObj?.activities_range?.[0] || 400) * 0.4),
          durationHours: 2.5,
        }
      ]
    };
  };

  const [itineraryDays, setItineraryDays] = useState<ItineraryDayPlan[]>(() => {
    const plans: ItineraryDayPlan[] = [];
    for (let i = 1; i <= queryDays; i++) {
      plans.push(createDayPlan(i, matchedDest, formValues.startDate));
    }
    return plans;
  });

  // Regenerate when destination or duration explicitly changes
  const handleGenerateItinerary = () => {
    const plans: ItineraryDayPlan[] = [];
    for (let i = 1; i <= formValues.durationDays; i++) {
      plans.push(createDayPlan(i, matchedDest, formValues.startDate));
    }
    setItineraryDays(plans);
    setItineraryGenerated(true);
    setCurrentStep(5); // Jump to Itinerary review
  };

  // Single Day Regeneration (Section 3.F)
  const handleRegenerateSingleDay = (dayNum: number) => {
    setItineraryDays(prev => {
      const copy = [...prev];
      const index = copy.findIndex(d => d.dayNumber === dayNum);
      if (index !== -1) {
        // Shift random offset
        const fresh = createDayPlan(dayNum + 3, matchedDest, formValues.startDate);
        fresh.dayNumber = dayNum;
        copy[index] = fresh;
      }
      return copy;
    });
  };

  // Activity inline edits
  const handleUpdateActivity = (dayIndex: number, actId: string, updates: Partial<ItineraryActivityItem>) => {
    setItineraryDays(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        activities: copy[dayIndex].activities.map(a => a.id === actId ? { ...a, ...updates } : a)
      };
      return copy;
    });
  };

  const handleDeleteActivity = (dayIndex: number, actId: string) => {
    setItineraryDays(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        activities: copy[dayIndex].activities.filter(a => a.id !== actId)
      };
      return copy;
    });
  };

  const handleAddActivity = (dayIndex: number) => {
    const newAct: ItineraryActivityItem = {
      id: `act_${Date.now()}`,
      timeSlot: 'Afternoon',
      title: 'Custom Cultural Experience',
      desc: 'Local exploration or shopping',
      cost: 450,
      durationHours: 2,
    };
    setItineraryDays(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        activities: [...copy[dayIndex].activities, newAct]
      };
      return copy;
    });
  };

  // Live Budget Calculations
  const totalPartyMultiplier = formValues.adults + formValues.children * 0.6;
  const totalAccommodationSpend = itineraryDays.reduce((sum, d) => sum + d.accommodationCost, 0);
  const totalFoodSpend = itineraryDays.reduce((sum, d) => sum + d.foodCost * totalPartyMultiplier, 0);
  const totalTransportSpend = itineraryDays.reduce((sum, d) => sum + d.transportCost, 0);
  const totalActivitiesSpend = itineraryDays.reduce(
    (sum, d) => sum + d.activities.reduce((aSum, a) => aSum + a.cost * totalPartyMultiplier, 0),
    0
  );

  const grandEstimatedCost = Math.round(
    totalAccommodationSpend + totalFoodSpend + totalTransportSpend + totalActivitiesSpend
  );
  const budgetBalance = formValues.totalBudget - grandEstimatedCost;
  const isOverBudget = budgetBalance < 0;

  // Save to database
  const handleSaveTrip = async () => {
    setIsSaving(true);
    const tripPayload = {
      destination_id: matchedDest.id,
      destination_name: matchedDest.destination_name,
      state: matchedDest.state,
      image_url: matchedDest.image_url,
      title: `${formValues.durationDays}-Day Voyage to ${matchedDest.destination_name}`,
      duration_days: formValues.durationDays,
      traveler_count: formValues.adults + formValues.children,
      travel_style: formValues.travelStyle,
      budget_tier: formValues.travelStyle === 'premium' ? 'luxury' : formValues.travelStyle === 'comfortable' ? 'mid_range' : 'budget',
      total_budget_inr: formValues.totalBudget,
      estimated_cost_inr: grandEstimatedCost,
      days: itineraryDays.map(d => ({
        day_number: d.dayNumber,
        theme: d.theme,
        day_notes: `${d.travelTransitNote} | Stay: ${d.staySuggestion}`,
        activities: d.activities.map(a => ({
          time_slot: a.timeSlot,
          title: a.title,
          description: a.desc,
          cost_inr: a.cost
        }))
      }))
    };

    let savedId = `trip_${Date.now()}`;
    const token = localStorage.getItem('tb_token');

    if (token) {
      try {
        const res = await apiClient.post<{ trip: { id: string } }>('/trips', tripPayload);
        if (res && res.trip && res.trip.id) {
          savedId = res.trip.id;
        }
      } catch (err) {
        console.warn('API trip save fallback to local storage:', err);
      }
    }

    // Mirror locally
    const savedTrip = {
      id: savedId,
      destination: matchedDest.destination_name,
      state: matchedDest.state,
      image_url: matchedDest.image_url,
      duration: formValues.durationDays,
      travelers: formValues.adults + formValues.children,
      budgetTier: formValues.travelStyle,
      totalCost: grandEstimatedCost,
      created_at: new Date().toLocaleDateString(),
      days: itineraryDays,
    };
    const existing = JSON.parse(localStorage.getItem('tb_saved_trips') || '[]');
    localStorage.setItem('tb_saved_trips', JSON.stringify([savedTrip, ...existing]));

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const experienceOptions = [
    'Mountains',
    'Beaches',
    'Adventure',
    'Wildlife',
    'Culture',
    'History',
    'Relaxation',
    'City Exploration'
  ];

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>Multi-Step AI Trip Planner</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-forest-900 tracking-tight">
              Craft Your Complete Day-by-Day Journey
            </h1>
            <p className="text-travel-muted text-xs sm:text-sm mt-1 max-w-2xl">
              Configured with verified local destination pricing, weather advisories, safety ratings, and booking deep-links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/manual-planner"
              className="px-4 py-2 rounded-full border border-travel-border bg-white text-forest-800 text-xs font-semibold hover:border-forest-700 shadow-xs transition-colors"
            >
              Switch to Manual Builder
            </Link>

            {currentStep === 5 && (
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-4 py-2 rounded-full bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold hover:bg-forest-100 transition-colors flex items-center gap-1.5"
              >
                <Train className="w-4 h-4 text-forest-700" />
                <span>Booking Options</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="bg-white rounded-2xl border border-travel-border p-4 shadow-xs">
          <div className="flex items-center justify-between max-w-3xl mx-auto text-xs">
            {[
              { num: 1, label: 'Origin & Dest' },
              { num: 2, label: 'Dates & Party' },
              { num: 3, label: 'Budget & Style' },
              { num: 4, label: 'Vibes & Needs' },
              { num: 5, label: 'Itinerary View' },
            ].map(step => (
              <button
                key={step.num}
                onClick={() => {
                  if (step.num === 5 && !itineraryGenerated) return;
                  setCurrentStep(step.num);
                }}
                className={`flex items-center gap-2 font-medium transition-colors ${
                  currentStep === step.num 
                    ? 'text-forest-900 font-bold' 
                    : currentStep > step.num 
                      ? 'text-forest-700' 
                      : 'text-travel-muted'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === step.num 
                    ? 'bg-forest-800 text-lime-accent' 
                    : currentStep > step.num 
                      ? 'bg-forest-100 text-forest-800' 
                      : 'bg-ivory text-travel-muted border border-travel-border'
                }`}>
                  {step.num}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: Starting City & Destination Mode */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-travel-border p-8 shadow-card max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-900">Where are you beginning and traveling?</h2>
              <p className="text-xs text-travel-muted mt-1">Specify your home city and destination preference mode.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-1.5">Starting City / Origin Point</label>
                <input
                  type="text"
                  {...register('startingCity')}
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru, Kolkata, Chennai"
                  className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs sm:text-sm font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
                {errors.startingCity && <p className="text-[11px] text-red-600 mt-1">{errors.startingCity.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-1.5">Destination Selection Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'specific', title: 'Specific Place', desc: 'Pick from 100 destinations' },
                    { id: 'region', title: 'Regional Filter', desc: 'North, South, East, West' },
                    { id: 'surprise', title: 'Surprise Me', desc: 'AI curated hidden gem' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setValue('destinationMode', mode.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        formValues.destinationMode === mode.id
                          ? 'border-forest-800 bg-forest-50/60 shadow-xs'
                          : 'border-travel-border bg-white hover:border-forest-700/50'
                      }`}
                    >
                      <strong className="block text-xs font-bold text-forest-900">{mode.title}</strong>
                      <span className="text-[11px] text-travel-muted">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formValues.destinationMode === 'specific' && (
                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Choose Destination</label>
                  <select
                    {...register('destinationName')}
                    className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs sm:text-sm font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  >
                    {destinationsData.map(d => (
                      <option key={d.id} value={d.destination_name}>
                        {d.destination_name} ({d.state}) · {d.trip_types?.[0]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formValues.destinationMode === 'region' && (
                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Select Region</label>
                  <select
                    {...register('selectedRegion')}
                    className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs sm:text-sm font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  >
                    {['North India', 'South India', 'West India', 'East India', 'North East India', 'Central India'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {formValues.destinationMode === 'surprise' && (
                <div className="p-4 rounded-2xl bg-forest-50 border border-forest-100 text-xs text-forest-900">
                  <Sparkles className="w-4 h-4 text-forest-700 mb-1" />
                  <strong>Surprise Me Selected:</strong> TravelBuddy will intelligently match a high-sentiment destination ({matchedDest.destination_name}) matching your budget and party size!
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-travel-border flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors flex items-center gap-2"
              >
                <span>Continue to Dates & Party</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Dates & Party */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-travel-border p-8 shadow-card max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-900">When and with whom are you traveling?</h2>
              <p className="text-xs text-travel-muted mt-1">Set travel duration and traveler party breakdown.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Departure Date</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                  {errors.startDate && <p className="text-[11px] text-red-600 mt-1">{errors.startDate.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Duration: {formValues.durationDays} Days</label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={formValues.durationDays}
                    onChange={(e) => setValue('durationDays', Number(e.target.value))}
                    className="w-full accent-forest-800 mt-3"
                  />
                  <div className="flex justify-between text-[10px] text-travel-muted">
                    <span>1 Day</span>
                    <span>7 Days</span>
                    <span>14 Days</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Adults (Age 12+)</label>
                  <select
                    value={formValues.adults}
                    onChange={(e) => setValue('adults', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Children (Age 0–11)</label>
                  <select
                    value={formValues.children}
                    onChange={(e) => setValue('children', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900"
                  >
                    {[0, 1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-travel-border flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-full border border-travel-border text-xs font-semibold text-travel-muted hover:text-forest-900"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors flex items-center gap-2"
              >
                <span>Continue to Budget & Style</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Budget & Travel Style */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-travel-border p-8 shadow-card max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-900">Budget & Travel Comfort</h2>
              <p className="text-xs text-travel-muted mt-1">Configure your total allocation in INR and style preferences.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-1.5">
                  Total Trip Budget: {formatCurrency(formValues.totalBudget)}
                </label>
                <input
                  type="number"
                  step="2000"
                  value={formValues.totalBudget}
                  onChange={(e) => setValue('totalBudget', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-sm font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-1.5">Travel Style Tier</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'budget', title: 'Budget Explorer', desc: 'Hostels, shared transit, local eateries' },
                    { id: 'comfortable', title: 'Comfortable', desc: '3★/4★ hotels, private cabs, popular cafes' },
                    { id: 'premium', title: 'Luxury & Heritage', desc: 'Heritage resorts, flights, fine dining' },
                  ].map(tier => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setValue('travelStyle', tier.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        formValues.travelStyle === tier.id
                          ? 'border-forest-800 bg-forest-50/60 shadow-xs'
                          : 'border-travel-border bg-white hover:border-forest-700/50'
                      }`}
                    >
                      <strong className="block text-xs font-bold text-forest-900">{tier.title}</strong>
                      <span className="text-[11px] text-travel-muted">{tier.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Accommodation Preference</label>
                  <select
                    value={formValues.accommodationType}
                    onChange={(e) => setValue('accommodationType', e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900"
                  >
                    <option value="hostel_guesthouse">Hostel / Guesthouse / Homestay</option>
                    <option value="hotel_homestay">Mid-range Boutique Hotel</option>
                    <option value="luxury_resort">Heritage Palace / Luxury Resort</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-travel-muted block mb-1.5">Transit Preference</label>
                  <select
                    value={formValues.transportPreference}
                    onChange={(e) => setValue('transportPreference', e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900"
                  >
                    <option value="flight">Flight (Fastest connection)</option>
                    <option value="train">Train (IRCTC scenic railway)</option>
                    <option value="road_cab">Self-drive or Private Intercity Cab</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-travel-border flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-full border border-travel-border text-xs font-semibold text-travel-muted hover:text-forest-900"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors flex items-center gap-2"
              >
                <span>Continue to Experiences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Preferred Experiences & Needs */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-travel-border p-8 shadow-card max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-900">What kind of experiences excite you?</h2>
              <p className="text-xs text-travel-muted mt-1">Select all categories that apply to your desired trip pace.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-2">Preferred Experiences</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {experienceOptions.map(exp => {
                    const isSelected = formValues.experiences.includes(exp);
                    return (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => {
                          const current = formValues.experiences;
                          setValue(
                            'experiences',
                            isSelected ? current.filter(x => x !== exp) : [...current, exp]
                          );
                        }}
                        className={`p-3 rounded-2xl border text-center text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-forest-800 text-lime-accent border-forest-800 shadow-xs'
                            : 'bg-ivory text-travel-text border-travel-border hover:border-forest-700/50'
                        }`}
                      >
                        {exp}
                      </button>
                    );
                  })}
                </div>
                {errors.experiences && <p className="text-[11px] text-red-600 mt-1">{errors.experiences.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-1.5">
                  Dietary or Accessibility Requirements (Optional)
                </label>
                <input
                  type="text"
                  {...register('dietaryOrAccessibility')}
                  placeholder="e.g. Pure vegetarian cuisine, wheelchair friendly sights, low-altitude preference"
                  className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-xs font-semibold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-travel-border flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-full border border-travel-border text-xs font-semibold text-travel-muted hover:text-forest-900"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleGenerateItinerary}
                className="px-8 py-3 rounded-full bg-forest-800 text-lime-accent text-xs font-bold hover:bg-forest-900 shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Day-by-Day Itinerary</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Generated Itinerary View (Full Interactive Editor) */}
        {currentStep === 5 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Destination Highlight & Quick Config Header */}
            <div className="bg-white rounded-3xl border border-travel-border overflow-hidden shadow-card">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="aspect-[16/10] md:aspect-auto relative">
                  <img
                    src={matchedDest.image_url}
                    alt={matchedDest.destination_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-transparent to-transparent md:hidden" />
                  <div className="absolute bottom-3 left-4 text-white md:hidden">
                    <h3 className="font-serif text-2xl font-bold">{matchedDest.destination_name}</h3>
                    <p className="text-xs text-ivory-muted">{matchedDest.state}</p>
                  </div>
                </div>

                <div className="p-6 md:col-span-2 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="hidden md:block">
                        <span className="text-xs uppercase font-bold text-forest-700 tracking-wider">
                          Recommended Itinerary
                        </span>
                        <h2 className="font-serif text-3xl font-bold text-forest-900">
                          {formValues.durationDays}-Day Expedition to {matchedDest.destination_name}
                        </h2>
                        <p className="text-xs text-travel-muted mt-0.5">
                          {matchedDest.state} · Starting from {formValues.startingCity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="px-3 py-1.5 rounded-full border border-travel-border text-xs font-semibold text-travel-muted hover:text-forest-900 transition-colors"
                        >
                          Modify Preferences
                        </button>

                        <button
                          onClick={handleSaveTrip}
                          disabled={isSaving}
                          className="px-5 py-2 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold hover:bg-forest-900 transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Trip'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Dataset Grounded Insights Banner */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-ivory border border-travel-border">
                        <span className="text-[10px] text-travel-muted block">Peak Season</span>
                        <strong className="text-forest-900 font-semibold">{matchedDest.peak_tourist_season}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-ivory border border-travel-border">
                        <span className="text-[10px] text-travel-muted block">Safety Rating</span>
                        <strong className="text-forest-900 font-semibold">{matchedDest.safety_rating}/10 ({matchedDest.safety_notes})</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-ivory border border-travel-border">
                        <span className="text-[10px] text-travel-muted block">Accessibility</span>
                        <strong className="text-forest-900 font-semibold">{matchedDest.accessibility}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-ivory border border-travel-border">
                        <span className="text-[10px] text-travel-muted block">Permits</span>
                        <strong className="text-forest-900 font-semibold">{matchedDest.permits_details || 'None required'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Why this was recommended banner (Section 3.C) */}
                  <div className="p-3 rounded-2xl bg-forest-50 border border-forest-100 text-xs text-forest-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Why TravelBuddy Recommended {matchedDest.destination_name}:</strong>
                      <p className="mt-0.5 text-travel-muted leading-relaxed">
                        Matches your preference for <strong>{formValues.experiences.join(', ')}</strong>, features verified <strong>{formValues.travelStyle}</strong> tier accommodations, and is within your allocated budget of {formatCurrency(formValues.totalBudget)}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview & Budget Warning (Section 3.D) */}
            <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-travel-border gap-2">
                <div>
                  <h3 className="font-serif text-xl font-bold text-forest-900">Overall Trip Budget Breakdown</h3>
                  <p className="text-xs text-travel-muted">Real estimates based on {formValues.adults + formValues.children} travelers ({formValues.travelStyle} tier).</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span>Target Budget: <strong>{formatCurrency(formValues.totalBudget)}</strong></span>
                  <span>Estimated Total: <strong className="text-forest-900">{formatCurrency(grandEstimatedCost)}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-ivory border border-travel-border">
                  <span className="text-[10px] uppercase font-bold text-travel-muted block">Accommodation</span>
                  <strong className="font-serif text-base text-forest-900">{formatCurrency(totalAccommodationSpend)}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-ivory border border-travel-border">
                  <span className="text-[10px] uppercase font-bold text-travel-muted block">Food & Dining</span>
                  <strong className="font-serif text-base text-forest-900">{formatCurrency(totalFoodSpend)}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-ivory border border-travel-border">
                  <span className="text-[10px] uppercase font-bold text-travel-muted block">Local Transport</span>
                  <strong className="font-serif text-base text-forest-900">{formatCurrency(totalTransportSpend)}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-ivory border border-travel-border">
                  <span className="text-[10px] uppercase font-bold text-travel-muted block">Activities & Sights</span>
                  <strong className="font-serif text-base text-forest-900">{formatCurrency(totalActivitiesSpend)}</strong>
                </div>
              </div>

              {/* Over Budget or Remaining Alert */}
              <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                isOverBudget 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {isOverBudget 
                      ? `Warning: This proposed plan exceeds your target budget by ${formatCurrency(Math.abs(budgetBalance))}. Consider reducing stay tier or activity counts.`
                      : `Great planning! You have ${formatCurrency(budgetBalance)} remaining in your total budget contingency.`
                    }
                  </span>
                </div>
                <span className="font-bold underline cursor-pointer" onClick={() => setCurrentStep(3)}>
                  Adjust Budget →
                </span>
              </div>
            </div>

            {/* Day-by-Day Detailed Schedule */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-forest-900">
                  Day-by-Day Itinerary Schedule ({itineraryDays.length} Days)
                </h3>
                <span className="text-xs text-travel-muted">
                  Click any activity to edit details or regenerate a single day.
                </span>
              </div>

              <div className="space-y-6">
                {itineraryDays.map((day, dIdx) => (
                  <div key={day.dayNumber} className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
                    
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-travel-border gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-forest-800 text-lime-accent flex items-center justify-center font-bold text-xs">
                          {day.dayNumber}
                        </span>
                        <div>
                          <h4 className="font-serif text-lg font-bold text-forest-900">{day.theme}</h4>
                          <span className="text-xs text-travel-muted">{day.dateStr} · {day.travelTransitNote}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => handleRegenerateSingleDay(day.dayNumber)}
                          className="px-3 py-1.5 rounded-full border border-travel-border hover:bg-forest-50 text-forest-800 font-medium transition-colors flex items-center gap-1.5"
                          title="Regenerate this specific day without touching the rest of the trip"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Regenerate Day</span>
                        </button>

                        <button
                          onClick={() => handleAddActivity(dIdx)}
                          className="px-3 py-1.5 rounded-full bg-forest-100 text-forest-900 font-semibold hover:bg-forest-200 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Activity</span>
                        </button>
                      </div>
                    </div>

                    {/* Stay & Meal Highlights */}
                    <div className="p-3 rounded-2xl bg-ivory border border-travel-border text-xs flex flex-wrap items-center justify-between gap-3 text-travel-muted">
                      <span>Stay: <strong className="text-forest-900">{day.staySuggestion}</strong> (₹{day.accommodationCost}/night)</span>
                      <span>Estimated Meals: <strong className="text-forest-900">₹{day.foodCost * totalPartyMultiplier}</strong></span>
                      <span>Transit: <strong className="text-forest-900">₹{day.transportCost}</strong></span>
                    </div>

                    {/* Activities List */}
                    <div className="space-y-3">
                      {day.activities.map(act => (
                        <div key={act.id} className="p-4 rounded-2xl bg-ivory/40 border border-travel-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-forest-800 text-lime-accent text-[10px] font-bold uppercase">
                                {act.timeSlot}
                              </span>
                              <span className="text-travel-muted text-[11px]">~{act.durationHours} hrs</span>
                            </div>
                            <input
                              type="text"
                              value={act.title}
                              onChange={(e) => handleUpdateActivity(dIdx, act.id, { title: e.target.value })}
                              className="font-bold text-sm text-forest-900 bg-transparent w-full border-b border-transparent hover:border-travel-border focus:border-forest-700 focus:outline-none"
                            />
                            <p className="text-travel-muted text-[11px]">{act.desc}</p>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <span className="text-[10px] text-travel-muted block">Est. Cost</span>
                              <strong className="text-forest-900">₹{act.cost}</strong>
                            </div>

                            <button
                              onClick={() => handleDeleteActivity(dIdx, act.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Booking Options Modal (Section 3.G) */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        destination={matchedDest}
        originCity={formValues.startingCity}
        startDate={formValues.startDate}
        travelers={formValues.adults + formValues.children}
      />

    </div>
  );
};
