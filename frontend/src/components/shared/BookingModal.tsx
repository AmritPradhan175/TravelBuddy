import React, { useState } from 'react';
import { 
  X, 
  Train, 
  Plane, 
  Hotel, 
  ExternalLink, 
  Info, 
  ShieldCheck, 
  Calendar, 
  Users, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import type { Destination } from '../../data/destinations';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination;
  originCity?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  destination,
  originCity = 'Delhi',
  startDate,
  endDate,
  travelers = 2,
}) => {
  const [activeTab, setActiveTab] = useState<'trains' | 'flights' | 'hotels'>('trains');

  if (!isOpen) return null;

  const destName = destination.destination_name;
  const airportInfo = destination.nearest_airport;
  const railwayInfo = destination.nearest_railway_station;

  // Build verified external search URLs with real parameters
  const encodedDest = encodeURIComponent(destName);
  const encodedOrigin = encodeURIComponent(originCity);

  // Train Links
  const irctcSearchUrl = `https://www.irctc.co.in/nget/train-search`;
  const confirmTktUrl = `https://www.confirmtkt.com/rbooking-d/trains-between-stations?from=${encodedOrigin}&to=${encodeURIComponent(railwayInfo?.name || destName)}`;

  // Flight Links
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=flights+from+${encodedOrigin}+to+${encodeURIComponent(airportInfo?.name || destName)}`;
  const skyscannerUrl = `https://www.skyscanner.co.in/transport/flights/${encodedOrigin.toLowerCase()}/${encodeURIComponent(airportInfo?.name || destName).toLowerCase()}/`;
  const mmtFlightsUrl = `https://www.makemytrip.com/flight/search?itinerary=${encodedOrigin}-${encodeURIComponent(airportInfo?.name || destName)}`;

  // Hotel Links
  const bookingDotComUrl = `https://www.booking.com/searchresults.html?ss=${encodedDest}&group_adults=${travelers}`;
  const agodaUrl = `https://www.agoda.com/search?city=${encodedDest}&adults=${travelers}`;
  const mmtHotelsUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodedDest}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-travel-border shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-forest-900 text-white flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-800 text-lime-accent text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified External Booking Partners</span>
            </div>
            <h3 className="font-serif text-2xl font-bold">
              Book Travel & Stay for {destName}
            </h3>
            <p className="text-xs text-ivory-muted/90 mt-1 flex items-center gap-3">
              <span>From: <strong>{originCity}</strong></span>
              <span>·</span>
              <span>Guests: <strong>{travelers}</strong></span>
              {startDate && (
                <>
                  <span>·</span>
                  <span>Date: <strong>{startDate}</strong></span>
                </>
              )}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-ivory-muted hover:text-white rounded-full hover:bg-forest-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-travel-border bg-ivory/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('trains')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'trains'
                ? 'bg-white border-forest-800 text-forest-900 shadow-xs'
                : 'border-transparent text-travel-muted hover:text-forest-900'
            }`}
          >
            <Train className="w-4 h-4 text-forest-700" />
            <span>Trains (IRCTC)</span>
          </button>

          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'flights'
                ? 'bg-white border-forest-800 text-forest-900 shadow-xs'
                : 'border-transparent text-travel-muted hover:text-forest-900'
            }`}
          >
            <Plane className="w-4 h-4 text-forest-700" />
            <span>Flights</span>
          </button>

          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'hotels'
                ? 'bg-white border-forest-800 text-forest-900 shadow-xs'
                : 'border-transparent text-travel-muted hover:text-forest-900'
            }`}
          >
            <Hotel className="w-4 h-4 text-forest-700" />
            <span>Hotels & Homestays</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Important Transparency Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-100 flex items-start gap-2.5 text-forest-900">
            <Info className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block text-[11px] font-bold">Direct Search Disclosures</strong>
              TravelBuddy generates deep-links to official Indian travel portals with your search criteria pre-loaded. We do not collect credit cards, store passenger IDs, or process mock bookings.
            </div>
          </div>

          {/* TAB 1: TRAINS */}
          {activeTab === 'trains' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-ivory border border-travel-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-travel-muted tracking-wider">Nearest Rail Junction</span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-forest-900">
                      {railwayInfo?.name || `${destName} Railway Station`}
                    </h4>
                    <p className="text-travel-muted">
                      Distance to center: {railwayInfo?.distance_km ? `${railwayInfo.distance_km} km` : 'In city'}
                    </p>
                  </div>
                  <Train className="w-6 h-6 text-forest-700" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={confirmTktUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex items-center justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">ConfirmTkt / IRCTC</strong>
                    <span className="text-travel-muted text-[11px]">Real-time seat availability & waitlist trends</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-forest-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href={irctcSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex items-center justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">Official IRCTC Portal</strong>
                    <span className="text-travel-muted text-[11px]">Government of India train ticketing</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-forest-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: FLIGHTS */}
          {activeTab === 'flights' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-ivory border border-travel-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-travel-muted tracking-wider">Nearest Airport</span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-forest-900">
                      {airportInfo?.name || `${destName} Domestic Airport`}
                    </h4>
                    <p className="text-travel-muted">
                      Distance to destination: {airportInfo?.distance_km ? `${airportInfo.distance_km} km` : 'Direct service'}
                    </p>
                  </div>
                  <Plane className="w-6 h-6 text-forest-700" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <a
                  href={googleFlightsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">Google Flights</strong>
                    <span className="text-travel-muted text-[11px]">Price graph & nonstop filters</span>
                  </div>
                  <div className="mt-3 flex items-center text-forest-700 font-semibold gap-1 text-[11px]">
                    <span>Search routes</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>

                <a
                  href={skyscannerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">Skyscanner</strong>
                    <span className="text-travel-muted text-[11px]">Aggregated budget carriers</span>
                  </div>
                  <div className="mt-3 flex items-center text-forest-700 font-semibold gap-1 text-[11px]">
                    <span>Compare fares</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>

                <a
                  href={mmtFlightsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">MakeMyTrip</strong>
                    <span className="text-travel-muted text-[11px]">Domestic airline discounts</span>
                  </div>
                  <div className="mt-3 flex items-center text-forest-700 font-semibold gap-1 text-[11px]">
                    <span>View offers</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: HOTELS */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-ivory border border-travel-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-travel-muted tracking-wider">Accommodation Scene</span>
                <p className="text-forest-900">
                  {Array.isArray(destination.accommodation_types) 
                    ? destination.accommodation_types.join(', ')
                    : 'Budget guesthouses, boutique heritage stays, and luxury resorts'}
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-semibold text-forest-800">
                  <span className="px-2 py-0.5 rounded bg-white border border-travel-border">
                    Budget: ₹{destination.budget_category?.accommodation_range?.[0] || 800}–₹{destination.budget_category?.accommodation_range?.[1] || 1500}/night
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-travel-border">
                    Mid-range: ₹{destination.mid_range_category?.accommodation_range?.[0] || 2000}–₹{destination.mid_range_category?.accommodation_range?.[1] || 4500}/night
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <a
                  href={bookingDotComUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">Booking.com</strong>
                    <span className="text-travel-muted text-[11px]">Verified guest reviews & free cancellation</span>
                  </div>
                  <div className="mt-3 flex items-center text-forest-700 font-semibold gap-1 text-[11px]">
                    <span>Check hotels</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>

                <a
                  href={agodaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">Agoda</strong>
                    <span className="text-travel-muted text-[11px]">Homestays and boutique villas</span>
                  </div>
                  <div className="mt-3 flex items-center text-forest-700 font-semibold gap-1 text-[11px]">
                    <span>View stays</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>

                <a
                  href={mmtHotelsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-travel-border hover:border-forest-700 bg-white hover:bg-forest-50/50 transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <strong className="text-forest-900 block font-semibold text-sm">MakeMyTrip Hotels</strong>
                    <span className="text-travel-muted text-[11px]">Curated Indian heritage properties</span>
                  </div>
                  <div className="mt-3 flex items-center text-forest-700 font-semibold gap-1 text-[11px]">
                    <span>Browse listings</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-travel-border bg-ivory/60 flex items-center justify-between text-xs text-travel-muted">
          <span>Search automatically configured for <strong>{destName}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-forest-800 text-lime-accent hover:bg-forest-900 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
