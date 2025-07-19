import { create } from 'zustand';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'RENTER' | 'MATE';
  name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  // Actions
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: 'Failed to fetch user' 
      });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      set({ error: 'Failed to logout' });
    }
  },

  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user, 
      loading: false 
    });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
})); 