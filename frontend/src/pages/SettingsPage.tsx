import React, { useState } from 'react';
import { Settings, Shield, Bell, Trash2, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, clearSearchHistory } = useAuth();
  const [currency, setCurrency] = useState('INR');
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearHistory = () => {
    clearSearchHistory();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            <Settings className="w-4 h-4 text-forest-700" />
            <span>Account Controls</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
            Settings & Privacy
          </h1>
          <p className="text-travel-muted text-sm mt-1">
            Manage your currency preferences, notifications, and stored browsing activity.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Currency & Localization */}
          <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest-900 border-b border-travel-border pb-3">
              Currency & Region
            </h3>
            <div className="max-w-xs">
              <label className="text-xs font-semibold text-travel-muted block mb-1.5">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-sm font-medium text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
              >
                <option value="INR">INR (₹) - Indian Rupee (Default dataset currency)</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>
          </div>

          {/* Privacy & Stored Data */}
          <div className="bg-white rounded-3xl border border-travel-border p-6 shadow-card space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest-900 border-b border-travel-border pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-forest-700" />
              Privacy & Local History Controls
            </h3>

            {clearedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>All search activity has been wiped clean from your browser session.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-ivory border border-travel-border">
              <div>
                <strong className="text-xs font-semibold text-forest-900 block">
                  Clear Search History
                </strong>
                <p className="text-[11px] text-travel-muted">
                  Remove all previous query logs stored in your local session.
                </p>
              </div>
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe History</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
