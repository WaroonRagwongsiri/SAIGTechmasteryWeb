import { create } from 'zustand';

interface BookingDetailsRenter {
  firstName: string;
  lastName: string;
}

interface BookingDetailsMate {
  firstName: string;
  lastName: string;
}

interface BookingDetails {
  id: number;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED';
  createdAt: string;
  renter: BookingDetailsRenter;
  mate: BookingDetailsMate;
}

interface BookingDetailsState {
  booking: BookingDetails | null;
  loading: boolean;
  error: string | null;
}

interface BookingDetailsActions {
  fetchBooking: (bookingId: string) => Promise<void>;
  proceedToPayment: (bookingId: string) => Promise<string | null>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearBooking: () => void;
}

type BookingDetailsStore = BookingDetailsState & BookingDetailsActions;

export const useBookingDetailsStore = create<BookingDetailsStore>((set, get) => ({
  // Initial state
  booking: null,
  loading: true,
  error: null,

  // Actions
  fetchBooking: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      
      const data = await response.json();
      set({ 
        booking: data.booking, 
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred', 
        loading: false 
      });
    }
  },

  proceedToPayment: async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const data = await response.json();
      return data.checkoutUrl || null;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Payment failed' });
      return null;
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

  clearBooking: () => {
    set({ booking: null, loading: true, error: null });
  },
})); 