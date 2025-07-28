import { create } from 'zustand';

interface BookingRenter {
	firstName: string;
	lastName: string;
}

interface BookingMate {
	firstName: string;
	lastName: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED';

interface Booking {
	id: string;
	activity: string;
	date: string;
	startTime: string;
	endTime: string;
	totalAmount?: number;
	status: 'PENDING' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED';
	createdAt?: string;
	renter: BookingRenter;
	mate?: BookingMate;
}
interface BookingsState {
	pendingBookings: Booking[];
	paymentPendingBookings: Booking[];
	confirmedBookings: Booking[];
	completedBookings: Booking[];
	cancelledBookings: Booking[];
	loadingStatuses: Set<BookingStatus>;
	error: string | null;
}

interface BookingsActions {
	fetchBookingsByStatus: (status: 'PENDING' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED') => Promise<void>;
	respondToBooking: (id: string, action: 'ACCEPT' | 'REJECT') => Promise<void>;
	setError: (error: string | null) => void;
	clearError: () => void;
	removePendingBooking: (id: string) => void;
	addConfirmedBooking: (booking: Booking) => void;
	clearBookings: () => void;
	removeCompletedBooking: (id: string) => void;
}

type BookingsStore = BookingsState & BookingsActions;

export const useBookingsStore = create<BookingsStore>((set, get) => ({
	// Initial state
	pendingBookings: [],
	paymentPendingBookings: [],
	confirmedBookings: [],
	completedBookings: [],
	cancelledBookings: [],
	loadingStatuses: new Set(),
	error: null,

	// Actions
	fetchBookingsByStatus: async (status) => {
		set((state) => ({
			loadingStatuses: new Set([...state.loadingStatuses, status]),
			error: null
		}));
		try {
			const res = await fetch(`/api/bookings?status=${status}`, {
				credentials: 'include'
			});
			if (!res.ok) throw new Error();

			const data = await res.json();

			set((state) => {
				const newState: Partial<BookingsState> = {};
				if (status === 'PENDING') newState.pendingBookings = data.bookings;
				if (status === 'CONFIRMED') newState.confirmedBookings = data.bookings;
				if (status === 'PAYMENT_PENDING') newState.paymentPendingBookings = data.bookings;
				if (status === 'COMPLETED') newState.completedBookings = data.bookings;
				if (status === 'CANCELLED') newState.cancelledBookings = data.bookings;

				return {
					...newState,
					loadingStatuses: new Set([...state.loadingStatuses].filter((s) => s !== status))
				};
			});
		} catch {
			set((state) => ({
				error: `Failed to fetch ${status.toLowerCase()} bookings`,
				loadingStatuses: new Set([...state.loadingStatuses].filter((s) => s !== status))
			}));
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

	removeCompletedBooking: (id) => {
		set((state) => ({
			completedBookings: state.completedBookings.filter((b) => b.id !== id)
		}));
	},
})); 