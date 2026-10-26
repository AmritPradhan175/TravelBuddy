import React, { useState } from 'react';
import { User, Mail, MapPin, Globe, Save, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || 'Amrit Pradhan');
  const [homeCity, setHomeCity] = useState(user?.home_city || 'Bengaluru');
  const [savedMessage, setSavedMessage] = useState(false);

  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    user?.preferences?.travel_styles || ['Nature', 'Cultural', 'Adventure']
  );

  const travelStyleOptions = [
    'Nature', 'Cultural', 'Adventure', 'Beach', 'Wildlife', 'Spiritual', 'Nightlife', 'Food', 'Photography'
  ];

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            <User className="w-4 h-4 text-forest-700" />
            <span>Profile & Travel Persona</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
            Personal Details & Travel Preferences
          </h1>
          <p className="text-travel-muted text-sm mt-1">
            Customize your travel style so our recommendation engine can curate relevant destinations for you.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-travel-border p-8 shadow-card space-y-8">
          
          <div className="flex items-center gap-6 pb-6 border-b border-travel-border">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-forest-100 shadow-xs"
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-900">{fullName}</h2>
              <p className="text-xs text-travel-muted">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest-100 text-forest-800">
                Verified Explorer
              </span>
            </div>
          </div>

          {savedMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Preferences and profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-travel-muted block mb-1.5">
                  Home Base City
                </label>
                <input
                  type="text"
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-travel-muted block mb-2">
                Travel Styles & Interests (Used for ML Recommendations)
              </label>
              <div className="flex flex-wrap gap-2">
                {travelStyleOptions.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                      selectedStyles.includes(style)
                        ? 'bg-forest-800 text-white font-semibold shadow-xs'
                        : 'bg-ivory border border-travel-border text-travel-text hover:bg-forest-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs tracking-wide shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
