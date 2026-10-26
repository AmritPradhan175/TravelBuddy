import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Bot, Send, ArrowRight, Check, Compass, MapPin } from 'lucide-react';

export const AIAssistantShowcase: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  const demoScenarios = [
    {
      query: "Which destinations suit my interests in nature, coffee plantations, and cool weather?",
      response: "Based on our 100-destination index, your best matches are:",
      places: [
        { name: "Coorg (Kodagu)", state: "Karnataka", match: "98% Match", reason: "Famous for lush Arabica coffee estates, abbey falls, and misty hills." },
        { name: "Munnar", state: "Kerala", match: "94% Match", reason: "Endless rolling tea plantations, cool mountain breeze, and high-altitude trekking." },
        { name: "Ooty", state: "Tamil Nadu", match: "91% Match", reason: "Botanical gardens, tea museum, and colonial estate charm." }
      ],
      budgetTip: "Est. daily mid-range budget: ₹3,200 – ₹5,500/day per person."
    },
    {
      query: "Plan a 3-day weekend trip to Goa within a ₹12,000 total budget.",
      response: "Here is your optimized 3-day budget itinerary in Goa:",
      places: [
        { name: "Day 1: Historic Old Goa", state: "Basilica of Bom Jesus & Fontainhas Latin Quarter", match: "₹1,800 spent", reason: "Walking tour, traditional Goan fish thali, and heritage churches." },
        { name: "Day 2: North Coast & Sunsets", state: "Anjuna, Vagator & Chapora Fort", match: "₹2,600 spent", reason: "Beach relaxation, sunset viewpoints, and local evening market." },
        { name: "Day 3: South Goa Serenity", state: "Palolem & Agonda Beach", match: "₹2,200 spent", reason: "Gentle swimming, quiet beach shacks, and river boat safari." }
      ],
      budgetTip: "Total estimated cost: ₹10,400 (well within your ₹12,000 cap)."
    },
    {
      query: "Suggest quiet hidden gems similar to Ladakh but with fewer crowds.",
      response: "Spiti Valley and Ziro Valley offer dramatic landscapes with tranquil solitude:",
      places: [
        { name: "Spiti Valley", state: "Himachal Pradesh", match: "96% Similar", reason: "High-altitude desert, ancient Key Monastery, and stark lunar terrain." },
        { name: "Ziro Valley", state: "Arunachal Pradesh", match: "89% Similar", reason: "Pine-clad hills, Apatani cultural villages, and tranquil paddy fields." }
      ],
      budgetTip: "Ideal season: June to September. Permits required for remote border passes."
    }
  ];

  const current = demoScenarios[selectedPrompt];

  return (
    <section className="py-20 bg-ivory border-t border-travel-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5 text-forest-700" />
              <span>Intelligent Travel Companion</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-forest-900 tracking-tight leading-tight">
              An AI assistant grounded in real travel data.
            </h2>

            <p className="text-travel-muted text-sm sm:text-base leading-relaxed">
              No generic hallucinations. TravelBuddy’s assistant queries our verified tourism database to calculate real budgets, suggest feasible daily schedules, and recommend matching spots.
            </p>

            {/* Prompt Selector Pills */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-travel-muted block">
                Try asking:
              </span>
              {demoScenarios.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPrompt(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-between gap-3 ${
                    selectedPrompt === idx
                      ? 'bg-forest-800 text-white border-forest-800 shadow-sm'
                      : 'bg-white text-forest-800 border-travel-border hover:bg-forest-50'
                  }`}
                >
                  <span className="line-clamp-1">"{demo.query}"</span>
                  <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 ${selectedPrompt === idx ? 'text-lime-accent' : 'text-travel-muted'}`} />
                </button>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs tracking-wide shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-lime-accent" />
                <span>Launch Interactive Assistant</span>
              </Link>
            </div>
          </div>

          {/* Right Simulated Chat Interface */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl md:rounded-3xl border border-travel-border shadow-elevated overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-800 text-lime-accent flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs block text-white">TravelBuddy AI Companion</span>
                    <span className="text-[10px] text-lime-accent flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse" />
                      Connected to 100 Destination Knowledge Base
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-forest-800 text-ivory-muted">
                  v1.2 Recommender
                </span>
              </div>

              {/* Chat Body */}
              <div className="p-5 md:p-6 space-y-4 bg-ivory/50">
                
                {/* User Message Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-forest-800 text-white text-xs sm:text-sm p-3.5 rounded-2xl rounded-tr-xs shadow-xs">
                    {current.query}
                  </div>
                </div>

                {/* Assistant Message Bubble */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-forest-800 text-lime-accent flex items-center justify-center flex-shrink-0 text-xs">
                    TB
                  </div>
                  <div className="max-w-[90%] space-y-3">
                    <div className="bg-white border border-travel-border p-4 rounded-2xl rounded-tl-xs shadow-xs text-xs sm:text-sm text-travel-text">
                      <p className="font-medium text-forest-900 mb-3">{current.response}</p>
                      
                      {/* Places cards inside response */}
                      <div className="space-y-2.5">
                        {current.places.map((p, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-ivory border border-travel-border flex items-start justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-1.5 font-semibold text-forest-900">
                                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                                <span>{p.name}</span>
                                <span className="text-[10px] font-normal text-travel-muted">({p.state})</span>
                              </div>
                              <p className="text-[11px] text-travel-muted mt-1 leading-snug">{p.reason}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-forest-100 text-forest-800 whitespace-nowrap">
                              {p.match}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Budget Note */}
                      <div className="mt-3 pt-2.5 border-t border-travel-border text-[11px] text-travel-muted flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-700" />
                        <span>{current.budgetTip}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chat Input Bar (Interactive preview) */}
              <div className="p-3 bg-white border-t border-travel-border flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="Ask anything: 'Suggest weekend trips from Delhi under ₹10,000'..."
                  className="w-full text-xs text-travel-muted bg-ivory px-3 py-2 rounded-full border border-travel-border focus:outline-none cursor-pointer"
                  onClick={() => window.location.href = '/ai-assistant'}
                />
                <Link
                  to="/ai-assistant"
                  className="p-2 rounded-full bg-forest-800 text-lime-accent hover:bg-forest-900 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
