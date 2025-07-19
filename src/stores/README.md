# Zustand Stores Documentation

This project uses Zustand for state management. The stores are organized by domain and provide a clean, type-safe way to manage application state.

## Available Stores

### 1. Auth Store (`useAuthStore`)

Manages user authentication state and actions.

**State:**
- `user`: Current user object or null
- `loading`: Loading state for auth operations
- `error`: Error message if any
- `isAuthenticated`: Boolean indicating if user is authenticated

**Actions:**
- `fetchUser()`: Fetch current user from API
- `logout()`: Logout user and clear state
- `setUser(user)`: Set user manually
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message
- `clearError()`: Clear error message

**Usage:**
```tsx
import { useAuthStore } from '@/stores';

function MyComponent() {
  const { user, loading, fetchUser, logout } = useAuthStore();
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Mates Store (`useMatesStore`)

Manages mates data and search functionality.

**State:**
- `mates`: Array of mate objects
- `loading`: Loading state for mates operations
- `error`: Error message if any
- `searchQuery`: Current search query

**Actions:**
- `fetchMates(query)`: Fetch mates with optional search query
- `setSearchQuery(query)`: Set search query
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message
- `clearError()`: Clear error message
- `clearMates()`: Clear mates array

**Usage:**
```tsx
import { useMatesStore } from '@/stores';

function MatesList() {
  const { mates, loading, searchQuery, fetchMates, setSearchQuery } = useMatesStore();
  
  useEffect(() => {
    fetchMates(searchQuery);
  }, [searchQuery, fetchMates]);
  
  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search mates..."
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        mates.map(mate => (
          <div key={mate.id}>{mate.user.firstName} {mate.user.lastName}</div>
        ))
      )}
    </div>
  );
}
```

### 3. Bookings Store (`useBookingsStore`)

Manages bookings data for mates (pending and confirmed bookings).

**State:**
- `pendingBookings`: Array of pending booking requests
- `confirmedBookings`: Array of confirmed bookings
- `loading`: Loading state for bookings operations
- `error`: Error message if any

**Actions:**
- `fetchBookingsByStatus(status)`: Fetch bookings by status ('PENDING' or 'CONFIRMED')
- `respondToBooking(id, action)`: Accept or reject a booking
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message
- `clearError()`: Clear error message
- `removePendingBooking(id)`: Remove booking from pending list
- `addConfirmedBooking(booking)`: Add booking to confirmed list
- `clearBookings()`: Clear all bookings

**Usage:**
```tsx
import { useBookingsStore } from '@/stores';

function MateDashboard() {
  const { 
    pendingBookings, 
    confirmedBookings, 
    fetchBookingsByStatus, 
    respondToBooking 
  } = useBookingsStore();
  
  useEffect(() => {
    fetchBookingsByStatus('PENDING');
    fetchBookingsByStatus('CONFIRMED');
  }, [fetchBookingsByStatus]);
  
  const handleResponse = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    await respondToBooking(id, action);
  };
  
  return (
    <div>
      <h2>Pending Requests</h2>
      {pendingBookings.map(booking => (
        <div key={booking.id}>
          <p>{booking.activity}</p>
          <button onClick={() => handleResponse(booking.id, 'ACCEPT')}>
            Accept
          </button>
          <button onClick={() => handleResponse(booking.id, 'REJECT')}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Booking Details Store (`useBookingDetailsStore`)

Manages individual booking details and payment processing.

**State:**
- `booking`: Current booking details object
- `loading`: Loading state for booking operations
- `error`: Error message if any

**Actions:**
- `fetchBooking(bookingId)`: Fetch booking details by ID
- `proceedToPayment(bookingId)`: Create checkout session for payment
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message
- `clearError()`: Clear error message
- `clearBooking()`: Clear current booking

**Usage:**
```tsx
import { useBookingDetailsStore } from '@/stores';

function BookingDetails({ bookingId }: { bookingId: string }) {
  const { booking, loading, error, fetchBooking, proceedToPayment } = useBookingDetailsStore();
  
  useEffect(() => {
    fetchBooking(bookingId);
  }, [bookingId, fetchBooking]);
  
  const handlePayment = async () => {
    const checkoutUrl = await proceedToPayment(bookingId);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!booking) return <div>Booking not found</div>;
  
  return (
    <div>
      <h1>{booking.activity}</h1>
      <p>Status: {booking.status}</p>
      {booking.status === 'PAYMENT_PENDING' && (
        <button onClick={handlePayment}>Complete Payment</button>
      )}
    </div>
  );
}
```

## Benefits of Using Zustand

1. **Type Safety**: All stores are fully typed with TypeScript
2. **Simplicity**: No providers or complex setup required
3. **Performance**: Automatic re-rendering only when subscribed state changes
4. **DevTools**: Built-in Redux DevTools support
5. **Middleware**: Easy to add middleware for logging, persistence, etc.
6. **Testing**: Easy to test with simple state management

## Best Practices

1. **Selective Subscriptions**: Only subscribe to the state you need in each component
2. **Action Composition**: Compose actions in stores rather than in components
3. **Error Handling**: Always handle errors in store actions
4. **Loading States**: Include loading states for async operations
5. **Type Safety**: Use TypeScript interfaces for all state and actions

## Migration from useState/useEffect

The refactoring from local state to Zustand stores provides:

- **Centralized State**: No more prop drilling or duplicate state
- **Reusable Logic**: Store actions can be used across multiple components
- **Better Performance**: Automatic memoization and selective re-rendering
- **Easier Testing**: Stores can be tested independently
- **Better Developer Experience**: Type safety and DevTools support 