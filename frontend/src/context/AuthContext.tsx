import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';
import { apiClient } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (fullName: string, email: string, password: string, homeCity?: string) => Promise<void>;
  logout: () => void;
  favorites: number[]; // destination IDs
  toggleFavorite: (destinationId: number) => Promise<void>;
  isFavorite: (destinationId: number) => boolean;
  searchHistory: string[];
  addSearchHistory: (query: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;
  viewedDestinations: number[];
  recordDestinationView: (destinationId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USER: User = {
  id: 'usr_demo_01',
  email: 'explorer@travelbuddy.ai',
  full_name: 'Amrit Pradhan',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  home_city: 'Bengaluru',
  preferences: {
    travel_styles: ['Nature', 'Cultural', 'Adventure'],
    preferred_regions: ['North India', 'South India'],
    default_budget_tier: 'mid_range',
    currency: 'INR',
  },
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tb_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('tb_favorites');
    return saved ? JSON.parse(saved) : [1, 2, 6, 7]; // Default favorites: Goa, Ladakh, Udaipur, Kerala
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('tb_search_history');
    return saved ? JSON.parse(saved) : ['Beaches in Goa', 'Ladakh high altitude passes', 'Heritage palaces in Udaipur'];
  });

  const [viewedDestinations, setViewedDestinations] = useState<number[]>(() => {
    const saved = localStorage.getItem('tb_viewed_destinations');
    return saved ? JSON.parse(saved) : [1, 2, 3, 5, 7];
  });

  // Fetch initial profile & favorites from API if token exists
  const syncWithBackend = useCallback(async () => {
    const token = localStorage.getItem('tb_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch current profile
      const userRes = await apiClient.get<{ user: User }>('/auth/me');
      if (userRes && userRes.user) {
        setUser(userRes.user);
        localStorage.setItem('tb_user', JSON.stringify(userRes.user));
      }

      // 2. Fetch favorites
      const favRes = await apiClient.get<{ favorites: Array<{ destination_id: number }> }>('/favorites');
      if (favRes && Array.isArray(favRes.favorites)) {
        const favIds = favRes.favorites.map(f => f.destination_id);
        if (favIds.length > 0) {
          setFavorites(favIds);
          localStorage.setItem('tb_favorites', JSON.stringify(favIds));
        }
      }

      // 3. Fetch search history
      const historyRes = await apiClient.get<{ history: Array<{ query: string }> }>('/history/search');
      if (historyRes && Array.isArray(historyRes.history)) {
        const queries = historyRes.history.map(h => h.query);
        if (queries.length > 0) {
          setSearchHistory(queries);
          localStorage.setItem('tb_search_history', JSON.stringify(queries));
        }
      }

      // 4. Fetch recently viewed destinations
      try {
        const viewsRes = await apiClient.get<{ views: Array<{ destination_id: number }> }>('/history/views');
        if (viewsRes && Array.isArray(viewsRes.views) && viewsRes.views.length > 0) {
          const viewIds = viewsRes.views.map(v => v.destination_id);
          setViewedDestinations(viewIds);
          localStorage.setItem('tb_viewed_destinations', JSON.stringify(viewIds));
        }
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn('API sync fallback to cached session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tb_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('tb_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('tb_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('tb_viewed_destinations', JSON.stringify(viewedDestinations));
  }, [viewedDestinations]);

  const login = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });

      if (res && res.token && res.user) {
        localStorage.setItem('tb_token', res.token);
        setUser(res.user);
        await syncWithBackend();
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err: any) {
      console.warn('Backend login error:', err.message);
      // If it is a network failure (server unreachable) and logging in with demo account, fall back to offline demo user
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) && email === 'explorer@travelbuddy.ai') {
        localStorage.setItem('tb_token', 'demo_token_explorer');
        localStorage.setItem('tb_user', JSON.stringify(DEMO_USER));
        setUser(DEMO_USER);
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      await login('explorer@travelbuddy.ai', 'password123');
    } catch (err) {
      console.info('Backend login failed, using local demo profile:', err);
      localStorage.setItem('tb_token', 'demo_token_explorer');
      localStorage.setItem('tb_user', JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, homeCity = 'Bengaluru') => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<{ token: string; user: User }>('/auth/register', {
        full_name: fullName,
        email,
        password,
        home_city: homeCity,
      });

      if (res && res.token && res.user) {
        localStorage.setItem('tb_token', res.token);
        setUser(res.user);
      } else {
        throw new Error('Failed to create account.');
      }
    } catch (err: any) {
      console.warn('Registration error:', err.message);
      // If network is completely offline/unreachable, create local offline profile for demo
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const localUser: User = {
          id: `usr_${Date.now()}`,
          email,
          full_name: fullName,
          home_city: homeCity,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          preferences: {
            travel_styles: ['Nature', 'Cultural'],
            preferred_regions: ['North India', 'South India'],
            default_budget_tier: 'mid_range',
            currency: 'INR',
          },
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('tb_token', `demo_token_${Date.now()}`);
        localStorage.setItem('tb_user', JSON.stringify(localUser));
        setUser(localUser);
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tb_token');
    localStorage.removeItem('tb_user');
    setUser(null);
  };

  const toggleFavorite = async (destinationId: number) => {
    const isCurrentlyFav = favorites.includes(destinationId);
    // Optimistic UI update
    setFavorites(prev => 
      isCurrentlyFav ? prev.filter(id => id !== destinationId) : [...prev, destinationId]
    );

    const token = localStorage.getItem('tb_token');
    if (token) {
      try {
        if (isCurrentlyFav) {
          await apiClient.delete(`/favorites/${destinationId}`);
        } else {
          await apiClient.post('/favorites', { destination_id: destinationId });
        }
      } catch (e) {
        console.warn('Failed to sync favorite with server:', e);
      }
    }
  };

  const isFavorite = (destinationId: number) => favorites.includes(destinationId);

  const addSearchHistory = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory(prev => [trimmed, ...prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10));

    const token = localStorage.getItem('tb_token');
    if (token) {
      try {
        await apiClient.post('/history/search', { query: trimmed });
      } catch (e) {
        console.warn('Failed to save search history to server:', e);
      }
    }
  };

  const clearSearchHistory = async () => {
    setSearchHistory([]);
    const token = localStorage.getItem('tb_token');
    if (token) {
      try {
        await apiClient.delete('/history/search');
      } catch (e) {
        console.warn('Failed to clear search history on server:', e);
      }
    }
  };

  const recordDestinationView = async (destinationId: number) => {
    setViewedDestinations(prev => [destinationId, ...prev.filter(id => id !== destinationId)].slice(0, 15));
    const token = localStorage.getItem('tb_token');
    if (token) {
      try {
        await apiClient.post('/history/views', { destination_id: destinationId });
      } catch (e) {
        console.warn('Failed to record destination view on server:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginDemo,
        register,
        logout,
        favorites,
        toggleFavorite,
        isFavorite,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
        viewedDestinations,
        recordDestinationView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
