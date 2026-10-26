import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, ShieldCheck, ArrowRight } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-forest-900 text-white relative overflow-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-forest-700/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-lime-soft/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-800 text-lime-accent text-xs font-semibold border border-forest-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>START YOUR NEXT EXPEDITION TODAY</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight max-w-3xl mx-auto">
          Every journey begins with a single curious thought.
        </h2>

        <p className="text-ivory-muted/80 text-sm sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
          Create an account to save your favorite destinations, track your searches, generate customized day-by-day itineraries, and receive personalized travel recommendations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-lime-accent hover:bg-lime-hover text-forest-900 font-bold text-sm tracking-wide shadow-lime-glow transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-forest-800 hover:bg-forest-700 text-white font-semibold text-sm border border-forest-700/80 transition-all duration-300"
          >
            <Compass className="w-4 h-4 text-lime-accent" />
            <span>Explore Destinations First</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-ivory-muted/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lime-accent" />
            <span>100% Free & Open Access</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lime-accent" />
            <span>Real Local Cost Calculations</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lime-accent" />
            <span>Privacy-First Data Architecture</span>
          </div>
        </div>

      </div>
    </section>
  );
};
