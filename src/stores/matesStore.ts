import { create } from 'zustand';

interface MateUser {
	firstName: string;
	lastName: string;
	profilePhoto?: string;
	dateOfBirth: string;
}

interface Mate {
	id: string;
	userId: string;
	bio?: string;
	hourlyRate: number;
	user: MateUser;
}

interface MatesState {
	mates: Mate[];
	loading: boolean;
	error: string | null;
	searchQuery: string;
	hasMore: boolean;
	page: number;
	limit: number;
	minRate: number;
	maxRate: number;
}

interface MatesActions {
	fetchMates: (query?: string, reset?: boolean) => Promise<void>;
	loadMoreMates: () => Promise<void>;
	setSearchQuery: (query: string) => void;
	setRateRange: (min: number, max: number) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
	clearMates: () => void;
}

type MatesStore = MatesState & MatesActions;

export const useMatesStore = create<MatesStore>((set, get) => ({
	// Initial state
	mates: [],
	loading: false,
	error: null,
	searchQuery: '',
	hasMore: true,
	page: 1,
	limit: 10,
	minRate: 0,
	maxRate: Infinity,
  
	setRateRange: (min, max) => {
	  set({ minRate: min, maxRate: max });
	},  

	// Actions
	fetchMates: async (query = '', reset = true) => {
		const state = get();
		const page = reset ? 1 : state.page;

		set({ loading: true, error: null });
		try {
			const res = await fetch(`/api/mates?query=${encodeURIComponent(query)}&page=${page}&limit=${state.limit}&minRate=${state.minRate}&maxRate=${state.maxRate}`, { 
				credentials: 'include' 
			  });			  

			if (res.ok) {
				const data = await res.json();
				const newMates = reset ? data.mates : [...state.mates, ...data.mates];

				set({
					mates: newMates,
					loading: false,
					searchQuery: query,
					page: page + 1,
					hasMore: data.mates.length === state.limit
				});
			} else {
				set({
					error: 'Failed to fetch mates',
					loading: false
				});
			}
		} catch (error) {
			set({
				error: 'Failed to fetch mates',
				loading: false
			});
		}
	},

	loadMoreMates: async () => {
		const state = get();
		if (!state.hasMore || state.loading) return;

		// Call fetchMates directly with current search query and reset=false
		const page = state.page;

		set({ loading: true, error: null });
		try {
			const res = await fetch(`/api/mates?query=${encodeURIComponent(state.searchQuery)}&page=${page}&limit=${state.limit}&minRate=${state.minRate}&maxRate=${state.maxRate}`, { 
				credentials: 'include' 
			  });
			  

			if (res.ok) {
				const data = await res.json();
				const newMates = [...state.mates, ...data.mates];

				set({
					mates: newMates,
					loading: false,
					page: page + 1,
					hasMore: data.mates.length === state.limit
				});
			} else {
				set({
					error: 'Failed to fetch mates',
					loading: false
				});
			}
		} catch (error) {
			set({
				error: 'Failed to fetch mates',
				loading: false
			});
		}
	},

	setSearchQuery: (query) => {
		set({ searchQuery: query });
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

	clearMates: () => {
		set({
			mates: [],
			searchQuery: '',
			page: 1,
			hasMore: true
		});
	},
})); 