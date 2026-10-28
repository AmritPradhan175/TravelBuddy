import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  MapPin, 
  Check, 
  Compass as CompassIcon,
  Palmtree,
  Mountain,
  Landmark,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const POPULAR_CITIES = [
  'Bengaluru',
  'Delhi',
  'Mumbai',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Jaipur',
  'Pune',
  'Kochi',
  'Ahmedabad',
];

const TRAVEL_VIBES = [
  { id: 'Nature', label: 'Nature & Scenic', icon: Palmtree },
  { id: 'Cultural', label: 'Heritage & Culture', icon: Landmark },
  { id: 'Adventure', label: 'Adventure & Trekking', icon: Mountain },
  { id: 'Beaches', label: 'Beaches & Coastal', icon: CompassIcon },
  { id: 'Spiritual', label: 'Spiritual & Peaceful', icon: Sparkles },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginDemo } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [homeCity, setHomeCity] = useState('Bengaluru');
  const [customCity, setCustomCity] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Nature', 'Cultural']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Toggle travel interest
  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) ? prev.filter(s => s !== styleId) : [...prev, styleId]
    );
  };

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    const hasMinLength = password.length >= 6;
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasStrongLength = password.length >= 8;

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasNumberOrSymbol) score += 1;
    if (hasUpperAndLower) score += 1;
    if (hasStrongLength) score += 1;

    let label = 'Weak';
    let colorClass = 'bg-red-500';
    let textClass = 'text-red-600';

    if (score === 2) {
      label = 'Fair';
      colorClass = 'bg-amber-500';
      textClass = 'text-amber-600';
    } else if (score === 3) {
      label = 'Good';
      colorClass = 'bg-emerald-500';
      textClass = 'text-emerald-600';
    } else if (score === 4) {
      label = 'Strong';
      colorClass = 'bg-forest-700';
      textClass = 'text-forest-700';
    }

    return {
      hasMinLength,
      hasNumberOrSymbol,
      hasUpperAndLower,
      hasStrongLength,
      score,
      label,
      colorClass,
      textClass,
    };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const chosenCity = homeCity === 'Other' ? customCity.trim() || 'Bengaluru' : homeCity;

    if (!cleanName || !cleanEmail || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your confirm password.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);
    try {
      await register(cleanName, cleanEmail, password, chosenCity);
      setSuccessMsg('Account created successfully! Preparing your personalized dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* ================= LEFT EDITORIAL TRAVEL HERO ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-forest-900 text-white overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Ambient Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=85')`,
          }}
        >
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

        {/* Center Editorial Showcase */}
        <div className="relative z-10 space-y-7 max-w-lg my-auto pt-10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800/70 border border-lime-accent/30 backdrop-blur-md text-lime-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 12,000+ Smart Explorers</span>
          </div>

          <h2 className="font-serif text-4xl xl:text-5xl font-bold leading-tight text-white">
            Plan extraordinary Indian journeys in minutes.
          </h2>

          <p className="text-sm xl:text-base text-gray-200 leading-relaxed">
            Create your profile to unlock custom daily schedules, realistic budgets, weather intelligence, and personalized recommendations tuned to your origin city.
          </p>

          {/* Three Feature Value Props */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-forest-800/50 backdrop-blur-md border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 font-bold" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI-Powered Day-by-Day Schedules</h4>
                <p className="text-[11px] text-gray-300">Morning, afternoon and evening optimized routes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-forest-800/50 backdrop-blur-md border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Direct Origin-to-Destination Distance</h4>
                <p className="text-[11px] text-gray-300">Realistic travel transit times from your home city</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-forest-800/50 backdrop-blur-md border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Transparent Budget Breakdown</h4>
                <p className="text-[11px] text-gray-300">Detailed hotel, food, sightseeing & local transit estimates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-800 border-2 border-lime-accent/50 flex items-center justify-center text-lime-accent font-bold text-xs">
              100%
            </div>
            <div>
              <p className="text-xs font-bold text-white">Free Forever Planning</p>
              <p className="text-[11px] text-gray-300">No credit card or booking fee required</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-lime-accent text-xs">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold text-white">Verified Places</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIGN UP FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">

          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-forest-900">TravelBuddy</span>
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-soft text-forest-900 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-forest-800" />
              <span>START YOUR JOURNEY</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-travel-muted">
              Join TravelBuddy to curate bucket lists, calculate accurate budgets & explore India.
            </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label 
                  htmlFor="signup-name" 
                  className="text-xs font-semibold text-travel-text block"
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Amrit Pradhan"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-travel-border bg-white text-sm text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent transition-all shadow-subtle"
                  />
                  <UserIcon className="w-4 h-4 text-travel-muted absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label 
                  htmlFor="signup-email" 
                  className="text-xs font-semibold text-travel-text block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-travel-border bg-white text-sm text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent transition-all shadow-subtle"
                  />
                  <Mail className="w-4 h-4 text-travel-muted absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Home City Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="signup-city" 
                  className="text-xs font-semibold text-travel-text block"
                >
                  Your Home City (for transit & budget calculations)
                </label>
                <span className="text-[11px] text-travel-muted">India</span>
              </div>
              <div className="relative">
                <select
                  id="signup-city"
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-travel-border bg-white text-sm text-travel-text focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent transition-all shadow-subtle appearance-none cursor-pointer"
                >
                  {POPULAR_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="Other">Other City...</option>
                </select>
                <MapPin className="w-4 h-4 text-travel-muted absolute left-3.5 top-3 pointer-events-none" />
                <div className="absolute right-3.5 top-3 text-travel-muted pointer-events-none text-xs">
                  ▼
                </div>
              </div>

              {homeCity === 'Other' && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter your home city name"
                    className="w-full px-3.5 py-2 rounded-xl border border-travel-border bg-white text-sm text-travel-text focus:outline-none focus:ring-2 focus:ring-forest-700 shadow-subtle"
                  />
                </div>
              )}
            </div>

            {/* Travel Vibes / Styles Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-travel-text block">
                Travel Styles You Enjoy (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_VIBES.map((vibe) => {
                  const isSelected = selectedStyles.includes(vibe.id);
                  const Icon = vibe.icon;
                  return (
                    <button
                      key={vibe.id}
                      type="button"
                      onClick={() => toggleStyle(vibe.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-forest-800 text-lime-accent shadow-xs scale-100 ring-2 ring-forest-700'
                          : 'bg-white border border-travel-border text-travel-text hover:bg-forest-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{vibe.label}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="signup-password" 
                className="text-xs font-semibold text-travel-text block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-travel-border bg-white text-sm text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent transition-all shadow-subtle"
                />
                <Lock className="w-4 h-4 text-travel-muted absolute left-3.5 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-travel-muted hover:text-forest-800 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-travel-muted">Password strength:</span>
                    <span className={`font-bold ${passwordCriteria.textClass}`}>
                      {passwordCriteria.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden flex gap-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCriteria.score >= 1 ? passwordCriteria.colorClass : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCriteria.score >= 2 ? passwordCriteria.colorClass : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCriteria.score >= 3 ? passwordCriteria.colorClass : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCriteria.score >= 4 ? passwordCriteria.colorClass : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="signup-confirm-password" 
                  className="text-xs font-semibold text-travel-text block"
                >
                  Confirm Password
                </label>
                {confirmPassword && (
                  <span className={`text-[11px] font-semibold ${
                    passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {passwordsMatch ? '✓ Matches' : '✗ Do not match'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-white text-sm text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-subtle ${
                    confirmPassword && !passwordsMatch 
                      ? 'border-red-300 focus:ring-red-400' 
                      : 'border-travel-border focus:ring-forest-700'
                  }`}
                />
                <Lock className="w-4 h-4 text-travel-muted absolute left-3.5 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-travel-muted hover:text-forest-800 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms and Privacy Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 rounded text-forest-800 focus:ring-forest-700 border-travel-border"
                />
                <span className="text-xs text-travel-muted leading-relaxed">
                  I agree to the{' '}
                  <span className="text-forest-800 font-semibold underline">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-forest-800 font-semibold underline">Privacy Policy</span>.
                  No spam, ever.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-lime-accent font-semibold text-sm tracking-wide shadow-md hover:shadow-lime-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-lime-accent/40 border-t-lime-accent rounded-full animate-spin" />
                  <span>Creating Your Account...</span>
                </>
              ) : (
                <>
                  <span>Create TravelBuddy Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign Up / Fast Demo Alternative */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-travel-border w-full" />
              <span className="bg-ivory px-3 text-[11px] uppercase tracking-wider text-travel-muted font-semibold">
                Or join instantly with
              </span>
              <div className="border-t border-travel-border w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginDemo();
                    navigate('/dashboard');
                  } catch {}
                }}
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
                onClick={async () => {
                  try {
                    await loginDemo();
                    navigate('/dashboard');
                  } catch {}
                }}
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
              Already have a TravelBuddy account?{' '}
              <Link
                to="/login"
                className="font-bold text-forest-800 hover:text-forest-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Sign in here</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
