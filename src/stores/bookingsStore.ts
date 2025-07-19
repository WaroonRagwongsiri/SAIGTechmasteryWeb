import { create } from 'zustand';

interface BookingRenter {
  firstName: string;
  lastName: string;
}

interface BookingMate {
  firstName: string;
  lastName: string;
}

interface Booking {
  id: string;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount?: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED';
  createdAt?: string;
  renter: BookingRenter;
  mate?: BookingMate;
}

interface BookingsState {
  pendingBookings: Booking[];
  confirmedBookings: Booking[];
  loading: boolean;
  error: string | null;
}

interface BookingsActions {
  fetchBookingsByStatus: (status: 'PENDING' | 'CONFIRMED') => Promise<void>;
  respondToBooking: (id: string, action: 'ACCEPT' | 'REJECT') => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  removePendingBooking: (id: string) => void;
  addConfirmedBooking: (booking: Booking) => void;
  clearBookings: () => void;
}

type BookingsStore = BookingsState & BookingsActions;

export const useBookingsStore = create<BookingsStore>((set, get) => ({
  // Initial state
  pendingBookings: [],
  confirmedBookings: [],
  loading: false,
  error: null,

  // Actions
  fetchBookingsByStatus: async (status) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/bookings?status=${status}`, { 
        credentials: 'include' 
      });
      
      if (res.ok) {
        const data = await res.json();
        if (status === 'PENDING') {
          set({ 
            pendingBookings: data.bookings, 
            loading: false 
          });
        } else if (status === 'CONFIRMED') {
          set({ 
            confirmedBookings: data.bookings, 
            loading: false 
          });
        }
      } else {
        set({ 
          error: `Failed to fetch ${status.toLowerCase()} bookings`, 
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: `Failed to fetch ${status.toLowerCase()} bookings`, 
        loading: false 
      });
    }
  },

  respondToBooking: async (id, action) => {
    try {
      const res = await fetch(`/api/bookings/${id}/${action.toLowerCase()}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (res.ok) {
        // Remove from pending bookings
        set((state) => ({
          pendingBookings: state.pendingBookings.filter((b) => b.id !== id)
        }));
        
        // If accepted, add to confirmed bookings
        if (action === 'ACCEPT') {
          const pendingBooking = get().pendingBookings.find(b => b.id === id);
          if (pendingBooking) {
            const confirmedBooking = { ...pendingBooking, status: 'CONFIRMED' as const };
            set((state) => ({
              confirmedBookings: [...state.confirmedBookings, confirmedBooking]
            }));
          }
        }
      } else {
        set({ error: `Failed to ${action.toLowerCase()} booking` });
      }
    } catch (error) {
      set({ error: `Failed to ${action.toLowerCase()} booking` });
    }
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

  removePendingBooking: (id) => {
    set((state) => ({
      pendingBookings: state.pendingBookings.filter((b) => b.id !== id)
    }));
  },

  addConfirmedBooking: (booking) => {
    set((state) => ({
      confirmedBookings: [...state.confirmedBookings, booking]
    }));
  },

  clearBookings: () => {
    set({ 
      pendingBookings: [], 
      confirmedBookings: [] 
    });
  },
})); 