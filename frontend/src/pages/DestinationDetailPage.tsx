import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  Bookmark, 
  Sparkles, 
  ShieldCheck, 
  Plane, 
  Train, 
  Car, 
  Wifi, 
  CreditCard, 
  Languages, 
  Utensils, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { destinationsData, type Destination } from '../data/destinations';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, ensureArray } from '../lib/utils';
import { DestinationCard } from '../components/shared/DestinationCard';
import { apiClient } from '../lib/api-client';
import { BookingModal } from '../components/shared/BookingModal';

export const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, recordDestinationView } = useAuth();

  const destinationId = Number(id);
  const destination = destinationsData.find(d => d.id === destinationId);
  const [bookingModalOpen, setBookingModalOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (destination) {
      recordDestinationView(destination.id);
      window.scrollTo(0, 0);
    }
  }, [destinationId, destination, recordDestinationView]);

  // Fallback similar destinations based on category and region
  const fallbackSimilar = useMemo(() => {
    if (!destination) return [];
    const myTypes = new Set(ensureArray(destination.trip_types));
    return destinationsData
      .filter(d => d.id !== destination.id)
      .map(d => {
        let score = 0;
        if (d.region === destination.region) score += 2;
        if (d.state === destination.state) score += 3;
        ensureArray(d.trip_types).forEach((t: string) => {
          if (myTypes.has(t)) score += 2;
        });
        return { destination: d, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.destination);
  }, [destination]);

  const [mlSimilar, setMlSimilar] = React.useState<Destination[]>([]);

  useEffect(() => {
    if (!destinationId) return;
    apiClient.get<{ similar_destinations: any[] }>(`/destinations/${destinationId}/similar`)
      .then(res => {
        if (res && Array.isArray(res.similar_destinations) && res.similar_destinations.length > 0) {
          const unwrapped = res.similar_destinations.map((item: any) => item.destination || item);
          setMlSimilar(unwrapped);
        }
      })
      .catch(() => {});
  }, [destinationId]);

  const displaySimilar = mlSimilar.length > 0 ? mlSimilar : fallbackSimilar;

  if (!destination) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto bg-ivory">
        <h2 className="font-serif text-3xl font-bold text-forest-900 mb-4">Destination Not Found</h2>
        <p className="text-travel-muted text-sm mb-6">The requested destination does not exist in our index.</p>
        <Link to="/explore" className="px-5 py-2.5 rounded-full bg-forest-800 text-lime-accent font-semibold text-xs">
          Return to Explorer
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(destination.id);
  const budgetDaily = destination.budget_category?.total_daily_range;
  const midDaily = destination.mid_range_category?.total_daily_range;
  const luxuryDaily = destination.luxury_category?.total_daily_range;

  return (
    <div className="bg-ivory min-h-screen pb-20">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-travel-border bg-white/60 backdrop-blur-md sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-travel-muted hover:text-forest-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-travel-muted">{destination.region}</span>
            <span className="text-travel-muted">/</span>
            <span className="text-travel-muted">{destination.state}</span>
            <span className="text-travel-muted">/</span>
            <span className="font-semibold text-forest-900">{destination.destination_name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(destination.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                favorited
                  ? 'bg-lime-accent text-forest-900 border-lime-accent shadow-xs'
                  : 'bg-white text-forest-800 border-travel-border hover:bg-forest-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${favorited ? 'fill-forest-900' : ''}`} />
              <span>{favorited ? 'Saved to Favorites' : 'Save Destination'}</span>
            </button>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Train className="w-3.5 h-3.5 text-forest-700" />
              <span>Bookings</span>
            </button>

            <Link
              to={`/plan-trip?dest=${encodeURIComponent(destination.destination_name)}&days=${destination.ideal_days || 5}`}
              className="px-4 py-1.5 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs tracking-wide shadow-xs"
            >
              Plan Trip Here
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Hero Banner with Cinematic Photo */}
        <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-travel-border aspect-[21/9] min-h-[360px] md:min-h-[460px]">
          <img
            src={destination.image_url}
            alt={destination.destination_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/30 to-black/30 pointer-events-none" />

          {/* Hero Information Overlay */}
          <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-lime-accent text-forest-900">
                  {destination.trip_types?.[0] || 'Scenic'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-forest-800/80 backdrop-blur-md text-white border border-white/20">
                  {destination.region}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-forest-800/80 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-lime-accent fill-lime-accent" />
                  Popularity {destination.popularity_score}/10
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {destination.destination_name}
              </h1>

              <div className="flex items-center gap-2 text-sm text-ivory-muted/90">
                <MapPin className="w-4 h-4 text-lime-accent" />
                <span>{destination.district}, {destination.state}</span>
                {destination.altitude_m > 0 && (
                  <>
                    <span>·</span>
                    <span>Altitude {destination.altitude_m}m</span>
                  </>
                )}
              </div>

            </div>

            {/* Quick Metrics Tile */}
            <div className="p-4 rounded-2xl bg-forest-900/85 backdrop-blur-md border border-forest-700/80 text-xs space-y-2 min-w-[240px]">
              <div className="flex justify-between items-center text-ivory-muted">
                <span>Recommended Stay:</span>
                <strong className="text-white font-semibold">{destination.ideal_days} Days</strong>
              </div>
              <div className="flex justify-between items-center text-ivory-muted">
                <span>Safety Rating:</span>
                <strong className="text-lime-accent font-semibold">{destination.safety_rating}/10</strong>
              </div>
              <div className="flex justify-between items-center text-ivory-muted">
                <span>Peak Season:</span>
                <strong className="text-white font-semibold">{destination.peak_tourist_season}</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Info Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Overview & Experiences */}
            <div className="bg-white rounded-3xl border border-travel-border p-6 md:p-8 shadow-card space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-forest-900 mb-3">
                  Overview & Unique Experiences
                </h2>
                <p className="text-sm sm:text-base text-travel-text leading-relaxed">
                  {destination.unique_experiences || destination.user_reviews_summary}
                </p>
                {destination.local_culture && (
                  <p className="text-xs sm:text-sm text-travel-muted mt-3 leading-relaxed">
                    <strong className="text-forest-900 font-semibold">Local Heritage: </strong>
                    {destination.local_culture}
                  </p>
                )}
              </div>

              {/* Primary Attractions */}
              <div className="pt-6 border-t border-travel-border">
                <h3 className="font-serif text-xl font-bold text-forest-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-forest-700" />
                  Primary Attractions & Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ensureArray(destination.primary_attractions).map((sight: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-ivory border border-travel-border flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-forest-800 text-lime-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-medium text-forest-900">{sight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Gems */}
              {destination.hidden_gems && ensureArray(destination.hidden_gems).length > 0 && (
                <div className="pt-6 border-t border-travel-border">
                  <h3 className="font-serif text-xl font-bold text-forest-900 mb-3 text-forest-700 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-forest-700" />
                    Off the Beaten Path / Hidden Gems
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(destination.hidden_gems).map((gem: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-lime-soft/40 border border-lime-accent text-forest-900 text-xs font-medium">
                        ✦ {gem}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Activities */}
              {destination.activities_available && ensureArray(destination.activities_available).length > 0 && (
                <div className="pt-6 border-t border-travel-border">
                  <h3 className="font-serif text-xl font-bold text-forest-900 mb-3">
                    Things To Do & Activities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(destination.activities_available).map((act: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-ivory text-travel-text text-xs border border-travel-border">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Itinerary Preview */}
              {destination.suggested_itinerary && (
                <div className="pt-6 border-t border-travel-border">
                  <h3 className="font-serif text-xl font-bold text-forest-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-forest-700" />
                    Curated Suggested Itinerary
                  </h3>
                  <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100 text-xs text-travel-text leading-relaxed whitespace-pre-line font-medium">
                    {destination.suggested_itinerary}
                  </div>
                </div>
              )}

            </div>

            {/* Comprehensive Budget Breakdown Table */}
            <div className="bg-white rounded-3xl border border-travel-border p-6 md:p-8 shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-forest-900">
                    Transparent Daily Cost Breakdown
                  </h2>
                  <p className="text-xs text-travel-muted mt-1">
                    Calculated in Indian Rupees (INR) from verified local accommodation, meals, and activities data.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-100 text-forest-800">
                  Per Person / Day
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Budget Tier */}
                <div className="p-4 rounded-2xl bg-ivory border border-travel-border space-y-3">
                  <div className="flex items-center justify-between border-b border-travel-border pb-2">
                    <span className="font-serif text-lg font-bold text-forest-900">Budget Tier</span>
                    <span className="text-[10px] uppercase font-semibold text-travel-muted">Hostels & Thalis</span>
                  </div>
                  <div className="space-y-1 text-xs text-travel-muted">
                    <div className="flex justify-between">
                      <span>Stay:</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.budget_category?.accommodation_range?.[0] || 800)} - {formatCurrency(destination.budget_category?.accommodation_range?.[1] || 1500)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food:</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.budget_category?.food_range?.[0] || 300)} - {formatCurrency(destination.budget_category?.food_range?.[1] || 600)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Activities:</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.budget_category?.activities_range?.[0] || 200)} - {formatCurrency(destination.budget_category?.activities_range?.[1] || 500)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-travel-border flex justify-between items-center text-xs font-bold text-forest-900">
                    <span>Total Daily:</span>
                    <span className="text-forest-800">
                      {budgetDaily ? `${formatCurrency(budgetDaily[0])} – ${formatCurrency(budgetDaily[1])}` : '₹1,500'}
                    </span>
                  </div>
                </div>

                {/* Mid-Range Tier */}
                <div className="p-4 rounded-2xl bg-forest-50/70 border border-forest-200 space-y-3 ring-1 ring-forest-700/20">
                  <div className="flex items-center justify-between border-b border-forest-200 pb-2">
                    <span className="font-serif text-lg font-bold text-forest-900">Mid-Range Tier</span>
                    <span className="text-[10px] uppercase font-bold text-forest-800">Popular Choice</span>
                  </div>
                  <div className="space-y-1 text-xs text-travel-muted">
                    <div className="flex justify-between">
                      <span>Stay (3-Star):</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.mid_range_category?.accommodation_range?.[0] || 2500)} - {formatCurrency(destination.mid_range_category?.accommodation_range?.[1] || 4500)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food (Cafes):</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.mid_range_category?.food_range?.[0] || 600)} - {formatCurrency(destination.mid_range_category?.food_range?.[1] || 1200)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Activities:</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.mid_range_category?.activities_range?.[0] || 500)} - {formatCurrency(destination.mid_range_category?.activities_range?.[1] || 1000)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-forest-200 flex justify-between items-center text-xs font-bold text-forest-900">
                    <span>Total Daily:</span>
                    <span className="text-forest-800">
                      {midDaily ? `${formatCurrency(midDaily[0])} – ${formatCurrency(midDaily[1])}` : '₹4,500'}
                    </span>
                  </div>
                </div>

                {/* Luxury Tier */}
                <div className="p-4 rounded-2xl bg-ivory border border-travel-border space-y-3">
                  <div className="flex items-center justify-between border-b border-travel-border pb-2">
                    <span className="font-serif text-lg font-bold text-forest-900">Luxury Tier</span>
                    <span className="text-[10px] uppercase font-semibold text-travel-muted">Resorts & Fine Dining</span>
                  </div>
                  <div className="space-y-1 text-xs text-travel-muted">
                    <div className="flex justify-between">
                      <span>Heritage/Resort:</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.luxury_category?.accommodation_range?.[0] || 8000)} - {formatCurrency(destination.luxury_category?.accommodation_range?.[1] || 20000)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fine Dining:</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.luxury_category?.food_range?.[0] || 1500)} - {formatCurrency(destination.luxury_category?.food_range?.[1] || 3500)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Private Tours:</span>
                      <span className="text-forest-900 font-medium">
                        {formatCurrency(destination.luxury_category?.activities_range?.[0] || 1000)} - {formatCurrency(destination.luxury_category?.activities_range?.[1] || 2500)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-travel-border flex justify-between items-center text-xs font-bold text-forest-900">
                    <span>Total Daily:</span>
                    <span className="text-forest-800">
                      {luxuryDaily ? `${formatCurrency(luxuryDaily[0])} – ${formatCurrency(luxuryDaily[1])}` : '₹12,000'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Sidebar / Logistics Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Action Box */}
            <div className="p-6 rounded-3xl bg-forest-900 text-white shadow-elevated space-y-4">
              <span className="text-xs uppercase font-semibold tracking-wider text-lime-accent block">
                Plan Your Journey
              </span>
              <h3 className="font-serif text-2xl font-bold leading-tight">
                Ready to explore {destination.destination_name}?
              </h3>
              <p className="text-xs text-ivory-muted/80 leading-relaxed">
                Generate a custom day-by-day plan with smart pacing, real local sights, and budget limits.
              </p>
              <Link
                to={`/plan-trip?dest=${encodeURIComponent(destination.destination_name)}&days=${destination.ideal_days || 5}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-lime-accent text-forest-900 font-bold text-xs hover:bg-lime-hover transition-colors"
              >
                <span>Generate Itinerary Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Transport & Accessibility */}
            <div className="p-6 rounded-3xl bg-white border border-travel-border shadow-card space-y-4 text-xs">
              <h4 className="font-serif text-lg font-bold text-forest-900 border-b border-travel-border pb-2">
                Travel Logistics
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Plane className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-forest-900 block">Nearest Airport:</span>
                    <span className="text-travel-muted">{destination.nearest_airport?.name} ({destination.nearest_airport?.distance_km} km)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Train className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-forest-900 block">Railway Station:</span>
                    <span className="text-travel-muted">{destination.nearest_railway_station?.name} ({destination.nearest_railway_station?.distance_km} km)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-forest-900 block">Road Connectivity:</span>
                    <span className="text-travel-muted">{destination.road_connectivity}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wifi className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-forest-900 block">Connectivity:</span>
                    <span className="text-travel-muted">{destination.internet_connectivity}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Languages className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-forest-900 block">Languages:</span>
                    <span className="text-travel-muted">
                      {Array.isArray(destination.language_spoken) ? destination.language_spoken.join(', ') : destination.language_spoken}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permits */}
              {destination.permits_required && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    Permit Required
                  </div>
                  <p className="text-[11px] leading-snug">{destination.permits_details || 'Inner Line Permit (ILP) required before travel.'}</p>
                </div>
              )}
            </div>

            {/* Local Cuisine & Specialties */}
            {destination.local_cuisine_must_try && (
              <div className="p-6 rounded-3xl bg-white border border-travel-border shadow-card space-y-3 text-xs">
                <h4 className="font-serif text-lg font-bold text-forest-900 border-b border-travel-border pb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-forest-700" />
                  Local Cuisine Must-Try
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {ensureArray(destination.local_cuisine_must_try).map((dish: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-ivory text-forest-900 font-medium border border-travel-border text-xs">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coordinates / Map Card */}
            {destination.coordinates && (
              <div className="p-6 rounded-3xl bg-white border border-travel-border shadow-card space-y-3 text-xs">
                <h4 className="font-serif text-lg font-bold text-forest-900 border-b border-travel-border pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest-700" />
                  Geographic Location
                </h4>
                <p className="text-travel-muted">
                  Coordinates: {destination.coordinates.latitude}° N, {destination.coordinates.longitude}° E
                </p>
                <div className="h-28 rounded-xl bg-forest-50 border border-travel-border flex flex-col items-center justify-center text-center p-3">
                  <span className="font-serif text-sm font-bold text-forest-900">
                    {destination.destination_name}
                  </span>
                  <span className="text-[11px] text-travel-muted mt-1">
                    Lat {destination.coordinates.latitude} · Long {destination.coordinates.longitude}
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Similar Destinations Section */}
        {displaySimilar.length > 0 && (
          <div className="pt-10 border-t border-travel-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-forest-700 block">
                  TF-IDF ML SIMILARITY
                </span>
                <h3 className="font-serif text-2xl font-bold text-forest-900">
                  Places Similar to {destination.destination_name}
                </h3>
              </div>
              <Link to="/explore" className="text-xs font-semibold text-forest-800 hover:underline">
                Explore More
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displaySimilar.map(d => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Booking Options Modal */}
      {destination && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          destination={destination}
          travelers={2}
        />
      )}

    </div>
  );
};
