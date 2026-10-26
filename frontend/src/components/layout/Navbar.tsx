import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Bookmark, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Search,
  Calendar,
  History,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, favorites } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/explore?search=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'AI Planner', path: '/plan-trip', icon: Sparkles },
    { name: 'Build Trip', path: '/manual-planner', icon: Calendar },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
    { name: 'About', path: '/about', icon: null },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-travel-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded-lg p-1">
            <div className="w-11 h-11 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:bg-forest-900">
              <Compass className="w-6 h-6 transform transition-transform duration-500 group-hover:rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-forest-800 group-hover:text-forest-900 transition-colors">
                TravelBuddy
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-travel-muted -mt-1">
                The world is yours
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-forest-800 text-white font-semibold shadow-sm'
                      : 'text-travel-text hover:text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${active ? 'text-lime-accent' : 'text-travel-muted'}`} />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick search input */}
            <form onSubmit={handleQuickSearch} className="relative">
              <input
                type="text"
                placeholder="Search places..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-44 lg:w-56 pl-9 pr-3 py-1.5 text-xs rounded-full border border-travel-border bg-white text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent transition-all"
              />
              <Search className="w-3.5 h-3.5 text-travel-muted absolute left-3 top-2.5 pointer-events-none" />
            </form>

            {/* Saved Destinations Badge */}
            <Link
              to="/favorites"
              title="Saved Destinations"
              className="relative p-2 rounded-full text-forest-800 hover:bg-forest-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
            >
              <Bookmark className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime-accent text-forest-900 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* User Account / Sign In */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                  className="flex items-center gap-2.5 p-1 pl-2 pr-3 rounded-full border border-travel-border hover:border-forest-700/40 bg-white transition-all text-sm font-medium text-forest-800"
                  aria-expanded={userDropdownOpen}
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                    alt={user.full_name}
                    className="w-7 h-7 rounded-full object-cover border border-forest-100"
                  />
                  <span className="max-w-[100px] truncate text-xs font-semibold">{user.full_name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-travel-muted" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-travel-border shadow-elevated py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-travel-border">
                      <p className="font-semibold text-forest-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-travel-muted truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-travel-text hover:bg-forest-50 hover:text-forest-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-travel-muted" />
                      Travel Dashboard
                    </Link>
                    <Link
                      to="/my-trips"
                      className="flex items-center gap-2.5 px-4 py-2 text-travel-text hover:bg-forest-50 hover:text-forest-800 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-travel-muted" />
                      My Trips & Itineraries
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-2.5 px-4 py-2 text-travel-text hover:bg-forest-50 hover:text-forest-800 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-travel-muted" />
                      Saved Destinations ({favorites.length})
                    </Link>
                    <Link
                      to="/history"
                      className="flex items-center gap-2.5 px-4 py-2 text-travel-text hover:bg-forest-50 hover:text-forest-800 transition-colors"
                    >
                      <History className="w-4 h-4 text-travel-muted" />
                      Search & Browsing History
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-travel-text hover:bg-forest-50 hover:text-forest-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-travel-muted" />
                      Settings & Preferences
                    </Link>

                    <div className="border-t border-travel-border mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-forest-800 hover:text-forest-900 px-3 py-2 rounded-lg hover:bg-forest-50 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Prominent CTA Button in soft lime accent */}
            <Link
              to="/plan-trip"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-lime-accent hover:bg-lime-hover text-forest-900 font-semibold text-xs tracking-wide shadow-sm hover:shadow-lime-glow transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-forest-900" />
              <span>Start Planning</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/favorites"
              className="p-2 text-forest-800 relative"
            >
              <Bookmark className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-lime-accent text-forest-900 text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-forest-800 hover:bg-forest-50 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-travel-border bg-ivory px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleQuickSearch} className="relative">
            <input
              type="text"
              placeholder="Search destinations, states, sights..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-travel-border bg-white text-travel-text"
            />
            <Search className="w-4 h-4 text-travel-muted absolute left-3 top-3" />
          </form>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-forest-800 text-white font-semibold'
                    : 'text-travel-text hover:bg-forest-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-travel-text hover:bg-forest-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-trips"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-travel-text hover:bg-forest-50"
                >
                  My Trips
                </Link>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-travel-border flex items-center justify-between">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.full_name})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-forest-800"
              >
                Sign In
              </Link>
            )}

            <Link
              to="/plan-trip"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-accent text-forest-900 font-semibold text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Planning</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
