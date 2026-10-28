import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo, user, isAuthenticated, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Redirect target if redirected from a protected action
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleFillDemo = () => {
    setEmail('explorer@travelbuddy.ai');
    setPassword('password123');
    setError('');
    setSuccessMsg('Demo credentials filled! Click "Sign In" or "1-Click Demo Login" below.');
  };

  const handleFastDemoLogin = async () => {
    setError('');
    setSuccessMsg('');
    setIsDemoLoading(true);
    try {
      await loginDemo();
      setSuccessMsg('Welcome, explorer! Redirecting to your travel dashboard...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Demo sign in failed. Please try again.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanEmail, password);
      setSuccessMsg('Signed in successfully! Loading your dashboard...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err: any) {
      setError(
        err.message || 
        'Unable to sign in. Please verify your email and password, or use the Demo Account button.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* ================= LEFT EDITORIAL TRAVEL HERO (Desktop) ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-forest-900 text-white overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Ambient Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1400&q=85')`,
          }}
        >
          {/* Deep Forest Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/65 to-forest-900/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-transparent to-forest-900/40" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-forest-800/90 backdrop-blur-md border border-lime-accent/30 text-lime-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 transform transition-transform group-hover:rotate-45" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                TravelBuddy
              </span>
              <span className="text-[11px] tracking-widest uppercase font-semibold text-lime-accent">
                AI Tourism & Trip Planner
              </span>
            </div>
          </Link>
        </div>

        {/* Center Editorial Quote & Badges */}
        <div className="relative z-10 space-y-8 max-w-lg my-auto pt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800/70 border border-lime-accent/30 backdrop-blur-md text-lime-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Itineraries for Incredible India</span>
          </div>

          <h2 className="font-serif text-4xl xl:text-5xl font-bold leading-tight text-white">
            Rediscover the joy of effortless travel.
          </h2>

          <p className="text-sm xl:text-base text-gray-200 leading-relaxed">
            From the snow-capped passes of Ladakh to Kerala&apos;s serene backwaters,
            curate bespoke itineraries, track realistic budgets, and explore verified hidden gems.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-forest-800/60 backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-lime-accent/20 text-lime-accent">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">50+ Destinations</p>
                <p className="text-[11px] text-gray-300">Across 20+ Indian states</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-forest-800/60 backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-lime-accent/20 text-lime-accent">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Smart Budgeting</p>
                <p className="text-[11px] text-gray-300">Stay, food & cab breakdown</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof Widget */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80"
                alt="Traveler"
                className="w-8 h-8 rounded-full border-2 border-forest-900 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&q=80"
                alt="Traveler"
                className="w-8 h-8 rounded-full border-2 border-forest-900 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80"
                alt="Traveler"
                className="w-8 h-8 rounded-full border-2 border-forest-900 object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-lime-accent text-xs">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                <span className="text-white font-bold ml-1 text-xs">4.9 / 5</span>
              </div>
              <p className="text-[11px] text-gray-300">Rated by 12,000+ happy explorers</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-gray-400 block">Season Recommendation</span>
            <span className="text-xs font-bold text-lime-accent">Winter / Spring 2026</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIGN IN FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-forest-900">TravelBuddy</span>
            </Link>
          </div>

          {/* Heading Section */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-forest-700" />
              <span>MEMBER PORTAL</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-travel-muted">
              Enter your credentials to access saved trips, favorites, and custom itineraries.
            </p>
          </div>

          {/* Active Session Warning (if user is already signed in) */}
          {isAuthenticated && user && (
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80'}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-forest-300"
                />
                <div>
                  <p className="font-semibold text-forest-900">Signed in as {user.full_name}</p>
                  <p className="text-[11px] text-travel-muted truncate max-w-[180px]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-2.5 py-1.5 rounded-lg bg-forest-800 text-lime-accent font-semibold text-[11px] hover:bg-forest-900 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2 py-1.5 rounded-lg border border-travel-border text-travel-muted hover:text-red-600 text-[11px] hover:bg-white transition-colors"
                >
                  Switch
                </button>
              </div>
            </div>
          )}

          {/* One-Click Fast-Pass Demo Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-forest-50 via-lime-soft/30 to-ivory border border-forest-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-lime-accent text-forest-900 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <span className="text-xs font-bold text-forest-900">
                  Quick Evaluation Account
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-forest-700 bg-forest-100 px-2 py-0.5 rounded-full">
                Pre-configured
              </span>
            </div>

            <p className="text-xs text-travel-muted leading-relaxed">
              Explore itineraries, saved favorites & ML recommendations without creating an account:
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleFastDemoLogin}
                disabled={isDemoLoading || isLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDemoLoading ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>1-Click Demo Login</span>
              </button>

              <button
                type="button"
                onClick={handleFillDemo}
                className="py-2 px-3 rounded-xl border border-forest-200 bg-white hover:bg-forest-50 text-forest-800 text-xs font-medium transition-colors"
                title="Fill demo email and password in the form"
              >
                Fill Form
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="signin-email" 
                className="text-xs font-semibold text-travel-text block"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. explorer@travelbuddy.ai"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-travel-border bg-white text-sm text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent transition-all shadow-subtle"
                />
                <Mail className="w-4 h-4 text-travel-muted absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="signin-password" 
                  className="text-xs font-semibold text-travel-text block"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-forest-700 hover:text-forest-900 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-travel-border bg-white text-sm text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent transition-all shadow-subtle"
                />
                <Lock className="w-4 h-4 text-travel-muted absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-travel-muted hover:text-forest-800 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-800 focus:ring-forest-700 border-travel-border"
                />
                <span className="text-xs text-travel-muted">Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isDemoLoading}
              className="w-full py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-lime-accent font-semibold text-sm tracking-wide shadow-md hover:shadow-lime-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-lime-accent/40 border-t-lime-accent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to TravelBuddy</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In Options */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-travel-border w-full" />
              <span className="bg-ivory px-3 text-[11px] uppercase tracking-wider text-travel-muted font-semibold">
                Or continue with
              </span>
              <div className="border-t border-travel-border w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleFastDemoLogin}
                className="py-2.5 px-4 rounded-xl border border-travel-border bg-white hover:bg-forest-50 text-travel-text text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-subtle"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleFastDemoLogin}
                className="py-2.5 px-4 rounded-xl border border-travel-border bg-white hover:bg-forest-50 text-travel-text text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-subtle"
              >
                <svg className="w-4 h-4 fill-current text-forest-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.65-2.81 1.45-.59.69-1.12 1.83-1 2.95 1.07.08 2.16-.57 2.82-1.3" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* Footer Callout */}
          <div className="pt-4 border-t border-travel-border text-center">
            <p className="text-xs text-travel-muted">
              Don&apos;t have a TravelBuddy account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-forest-800 hover:text-forest-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Create free account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
