import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('explorer@travelbuddy.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 bg-ivory min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-travel-border p-8 shadow-card space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold text-forest-900">TravelBuddy</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-forest-900 pt-2">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-travel-muted">
            Access your saved itineraries, custom trips, and ML recommendations.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-travel-muted block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-sm text-travel-text focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white"
                placeholder="name@example.com"
              />
              <Mail className="w-4 h-4 text-travel-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-travel-muted block">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-forest-800 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-sm text-travel-text focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-travel-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to TravelBuddy'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-travel-border text-xs text-travel-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-forest-800 hover:underline">
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
};
