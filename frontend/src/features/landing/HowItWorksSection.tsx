import React from 'react';
import { Compass, CalendarCheck, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Discover your ideal destination',
      description: 'Explore 100 destinations across India with multi-factor filters matching your budget tier, travel style, and optimal travel season.',
      icon: Compass,
      highlights: ['Content-based ML similarity', 'Exact INR budget calculations', 'Safety & climate data']
    },
    {
      number: '02',
      title: 'Personalize your travel itinerary',
      description: 'Generate structured day-by-day plans with morning, afternoon, and evening sights, activity pacing, and real distance logistics.',
      icon: CalendarCheck,
      highlights: ['Custom duration (3 to 14 days)', 'Add, remove, or reorder activities', 'Transparent local costs']
    },
    {
      number: '03',
      title: 'Save and enjoy your journey',
      description: 'Store itineraries in your persistent dashboard, bookmark favorite places, and consult the AI assistant anytime before and during your trip.',
      icon: MapPin,
      highlights: ['Persistent PostgreSQL history', 'Interactive travel dashboard', 'Export & share trip plans']
    }
  ];

  return (
    <section className="py-20 bg-white border-t border-travel-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            <span>Effortless Travel Planning</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-forest-900 tracking-tight">
            How TravelBuddy Works
          </h2>
          <p className="text-travel-muted text-sm sm:text-base mt-2">
            From initial wanderlust to a finished day-by-day itinerary in three simple steps.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="relative bg-ivory rounded-2xl p-8 border border-travel-border shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-4xl font-bold text-forest-800/20">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-forest-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-travel-muted leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Highlights */}
                <div className="pt-4 border-t border-travel-border/80 space-y-2">
                  {step.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-forest-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
