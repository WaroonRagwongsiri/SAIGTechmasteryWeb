"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { Clock, CheckCircle, XCircle, CreditCard, Calendar, User, DollarSign } from "lucide-react";
import { useBookingsStore } from "@/stores";
import { useAuthStore } from "@/stores";

interface BookingMate {
	firstName: string;
	lastName: string;
}

interface BookingRenter {
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
	status: 'PENDING' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED';
	createdAt?: string;
	renter: BookingRenter;
	mate?: BookingMate;
}

const BookingList = () => {
	const { pendingBookings, paymentPendingBookings, confirmedBookings, completedBookings, cancelledBookings, loadingStatuses, fetchBookingsByStatus, removeCompletedBooking } = useBookingsStore();
	const { user } = useAuthStore();

	useEffect(() => {
		const fetchBookings = async () => {
			if (pendingBookings.length === 0 && !loadingStatuses.has('PENDING')) {
				await fetchBookingsByStatus('PENDING');
			}
			if (paymentPendingBookings.length === 0 && !loadingStatuses.has('PAYMENT_PENDING')) {
				await fetchBookingsByStatus('PAYMENT_PENDING');
			}
			if (confirmedBookings.length === 0 && !loadingStatuses.has('CONFIRMED')) {
				await fetchBookingsByStatus('CONFIRMED');
			}
			if (completedBookings.length === 0 && !loadingStatuses.has('COMPLETED')) {
				await fetchBookingsByStatus('COMPLETED');
			}
			if (cancelledBookings.length === 0 && !loadingStatuses.has('CANCELLED')) {
				await fetchBookingsByStatus('CANCELLED');
			}
		};
		fetchBookings();
	}, [fetchBookingsByStatus]);
	const getStatusBadge = (status: string) => {
		const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

		switch (status) {
			case 'PENDING':
				return (
					<span className={`${baseClasses} bg-blue-100 text-blue-800`}>
						<Clock className="w-4 h-4 mr-1" />
						Pending
					</span>
				);
			case 'PAYMENT_PENDING':
				return (
					<span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
						<CreditCard className="w-4 h-4 mr-1" />
						Wait for Payment
					</span>
				);
			case 'CONFIRMED':
				return (
					<span className={`${baseClasses} bg-green-100 text-green-800`}>
						<CheckCircle className="w-4 h-4 mr-1" />
						Confirmed
					</span>
				);
			case 'COMPLETED':
				return (
					<span className={`${baseClasses} bg-purple-100 text-purple-800`}>
						<CheckCircle className="w-4 h-4 mr-1" />
						Completed
					</span>
				);
			case 'CANCELLED':
				return (
					<span className={`${baseClasses} bg-red-100 text-red-800`}>
						<XCircle className="w-4 h-4 mr-1" />
						Cancelled
					</span>
				);
			default:
				return null;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const formatTime = (timeString: string) => {
		return new Date(`1970-01-01T${timeString}:00`).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	const [ratingStates, setRatingStates] = useState<{ [bookingId: string]: number }>({});
	const [submitting, setSubmitting] = useState<{ [bookingId: string]: boolean }>({});

	const handleRatingChange = (bookingId: string, value: number) => {
		setRatingStates((prev) => ({ ...prev, [bookingId]: value }));
	};

	const handleSubmitRating = async (bookingId: string) => {
		const rating = ratingStates[bookingId];
		if (!rating) return;
		setSubmitting((prev) => ({ ...prev, [bookingId]: true }));
		try {
			const res = await fetch(`/api/bookings/${bookingId}/rating`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ rating }),
			});
			if (res.ok) {
				// Remove the booking from completedBookings
				removeCompletedBooking(bookingId);
				// Optionally show a success message
			} else {
				// Optionally handle error
			}
		} finally {
			setSubmitting((prev) => ({ ...prev, [bookingId]: false }));
		}
	};

	const BookingCard = ({ booking }: { booking: Booking }) => (
		<div key={booking.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start mb-4">
				<h3 className="text-lg font-semibold text-gray-900">{booking.activity}</h3>
				{getStatusBadge(booking.status)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<div className="flex items-center space-x-3">
					<Calendar className="h-5 w-5 text-gray-400" />
					<div>
						<p className="text-sm font-medium text-gray-500">Date</p>
						<p className="text-gray-900">{formatDate(booking.date)}</p>
					</div>
				</div>

				<div className="flex items-center space-x-3">
					<Clock className="h-5 w-5 text-gray-400" />
					<div>
						<p className="text-sm font-medium text-gray-500">Time</p>
						<p className="text-gray-900">
							{formatTime(booking.startTime)} - {formatTime(booking.endTime)}
						</p>
					</div>
				</div>

				<div className="flex items-center space-x-3">
					<User className="h-5 w-5 text-gray-400" />
					<div>
						<p className="text-sm font-medium text-gray-500">Mate</p>
						<p className="text-gray-900">
							{booking.mate?.firstName || 'N/A'} {booking.mate?.lastName || 'N/A'}
						</p>
					</div>
				</div>

				<div className="flex items-center space-x-3">
					<DollarSign className="h-5 w-5 text-gray-400" />
					<div>
						<p className="text-sm font-medium text-gray-500">Total Amount</p>
						<p className="text-gray-900 font-semibold">
							฿{booking.totalAmount?.toFixed(2) || 'N/A'}
						</p>
					</div>
				</div>
			</div>

			{booking.status === 'PAYMENT_PENDING' && (
				<div className="mt-4 pt-4 border-t">
					<a
						href={`/bookings/${booking.id}`}
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						<CreditCard className="w-4 h-4 mr-2" />
						Complete Payment
					</a>
				</div>
			)}
			{booking.status === 'COMPLETED' && user?.role === 'RENTER' && (
				<div className="mt-4 pt-4 border-t">
					<p className="mb-2 font-medium">Rate your experience:</p>
					<div className="flex items-center space-x-2 mb-2">
						{[1,2,3,4,5].map((star) => (
							<button
								key={star}
								type="button"
								className={`text-2xl ${ratingStates[booking.id] >= star ? 'text-yellow-400' : 'text-gray-300'}`}
								onClick={() => handleRatingChange(booking.id, star)}
								aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
							>
								★
							</button>
						))}
					</div>
					<button
						disabled={submitting[booking.id] || !ratingStates[booking.id]}
						onClick={() => handleSubmitRating(booking.id)}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
					>
						{submitting[booking.id] ? 'Submitting...' : 'Submit Rating'}
					</button>
				</div>
			)}
		</div>
	);

	const BookingSection = ({ title, bookings, emptyMessage }: { title: string; bookings: Booking[]; emptyMessage: string }) => (
		<div className="mb-8">
			<h2 className="text-2xl font-bold mb-4 text-gray-900">{title}</h2>
			{bookings.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{bookings.map((booking) => (
						<BookingCard key={booking.id} booking={booking} />
					))}
				</div>
			) : (
				<div className="text-center py-8 bg-gray-50 rounded-lg">
					<p className="text-gray-500">{emptyMessage}</p>
				</div>
			)}
		</div>
	);

	if (loadingStatuses.size > 0) {
		return (
			<div>
				<Navbar />
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

				<BookingSection
					title="Pending Bookings"
					bookings={pendingBookings}
					emptyMessage="No pending bookings"
				/>

				<BookingSection
					title="Confirmed Bookings (Wait for Payment)"
					bookings={paymentPendingBookings}
					emptyMessage="No bookings waiting for payment"
				/>

				<BookingSection
					title="Confirmed Bookings"
					bookings={confirmedBookings}
					emptyMessage="No confirmed bookings"
				/>

				<BookingSection
					title="Completed Bookings"
					bookings={completedBookings}
					emptyMessage="No completed bookings"
				/>

				<BookingSection
					title="Cancelled Bookings"
					bookings={cancelledBookings}
					emptyMessage="No cancelled bookings"
				/>
			</div>
		</div>
	);
};

export default BookingList;
