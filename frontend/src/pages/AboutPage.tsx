import React from 'react';
import { Compass, Sparkles, Shield, Database, Brain, Globe, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 bg-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-forest-700" />
            <span>ABOUT TRAVELBUDDY</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest-900 leading-tight">
            "The world is yours to discover."
          </h1>
          <p className="text-travel-muted text-base leading-relaxed">
            TravelBuddy was engineered as a high-performance travel-tech platform combining curated destination discovery, machine learning recommendations, realistic local cost calculations, and intelligent day-by-day itinerary planning.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-lime-accent flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-900">
              Verified Tourism Data
            </h3>
            <p className="text-xs text-travel-muted leading-relaxed">
              Every destination is supported by structured data covering altitudes, regional safety indices, optimal weather seasons, local cuisines, and airport/railway proximity.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-lime-accent flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-900">
              Machine Learning Engine
            </h3>
            <p className="text-xs text-travel-muted leading-relaxed">
              Utilizes multi-attribute TF-IDF and Cosine Similarity to compute affinity between traveler interests and destination characteristics, avoiding generic hallucinations.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-lime-accent flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-900">
              Transparent Local Costs
            </h3>
            <p className="text-xs text-travel-muted leading-relaxed">
              Calculates daily costs in Indian Rupees (INR) across Budget, Mid-Range, and Luxury tiers for honest trip budgeting without fabricated precision.
            </p>
          </div>
        </div>

        {/* Technical Architecture Overview */}
        <div className="bg-forest-900 rounded-3xl text-white p-8 md:p-10 shadow-elevated space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-lime-accent block mb-1">
              ENGINEERING ARCHITECTURE
            </span>
            <h2 className="font-serif text-3xl font-bold">
              Full-Stack Architecture & Core Technologies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-ivory-muted/90">
            <div className="space-y-3 bg-forest-800/60 p-5 rounded-2xl border border-forest-700">
              <strong className="text-white text-sm font-semibold block">Frontend Architecture</strong>
              <p>• React 19 + TypeScript with strict typing</p>
              <p>• Vite with fast HMR and optimized bundler</p>
              <p>• Tailwind CSS with customized editorial palette</p>
              <p>• TanStack Query for server state caching & mutations</p>
              <p>• Lucide React icons with accessible keyboard navigation</p>
            </div>

            <div className="space-y-3 bg-forest-800/60 p-5 rounded-2xl border border-forest-700">
              <strong className="text-white text-sm font-semibold block">Backend & ML Architecture</strong>
              <p>• Python with Flask REST API & versioned /api/v1 routes</p>
              <p>• PostgreSQL persistent relational database with SQLAlchemy ORM</p>
              <p>• Scikit-Learn TF-IDF vectorization & feature similarity</p>
              <p>• Argon2 / Bcrypt secure password hashing and session tokens</p>
              <p>• Flask-Migrate & Alembic for version-controlled migrations</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
