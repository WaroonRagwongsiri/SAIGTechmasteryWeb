// app/booking/[id]/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Calendar, Clock, User, DollarSign, CheckCircle, XCircle, AlertCircle, CreditCard } from 'lucide-react';
import { useBookingDetailsStore } from '@/stores';

export default function BookingDetailsPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const bookingId = params.id as string;

	const booking = useBookingDetailsStore((state) => state.booking);
	const loading = useBookingDetailsStore((state) => state.loading);
	const error = useBookingDetailsStore((state) => state.error);
	const fetchBooking = useBookingDetailsStore((state) => state.fetchBooking);

	const success = searchParams.get('success') === 'true';
	const canceled = searchParams.get('canceled') === 'true';

	useEffect(() => {
		fetchBooking(bookingId);
	}, [bookingId]);

	const handlePayment = async () => {
		try {
			const res = await fetch(`/api/checkout/${bookingId}`, {
				credentials: 'include'
			});
			const data = await res.json();

			if (res.ok && data.url) {
				window.location.href = data.url;
			} else {
				const errorMessage = data.error || "Unable to initiate payment.";
				alert(`Payment Error: ${errorMessage}`);
				console.error("Payment error:", data);
			}
		} catch (error) {
			console.error("Payment error:", error);
			alert("Network error. Please check your connection and try again.");
		}
	};

	const getStatusBadge = (status: string) => {
		const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

		switch (status) {
			case 'PENDING':
				return (
					<span className={`${baseClasses} bg-blue-100 text-blue-800`}>
						<AlertCircle className="w-4 h-4 mr-1" />
						Pending
					</span>
				);
			case 'PAYMENT_PENDING':
				return (
					<span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
						<AlertCircle className="w-4 h-4 mr-1" />
						Payment Pending
					</span>
				);
			case 'CONFIRMED':
				return (
					<span className={`${baseClasses} bg-green-100 text-green-800`}>
						<CheckCircle className="w-4 h-4 mr-1" />
						Confirmed
					</span>
				);
			case 'CANCELLED':
				return (
					<span className={`${baseClasses} bg-red-100 text-red-800`}>
						<XCircle className="w-4 h-4 mr-1" />
						Cancelled
					</span>
				);
			case 'COMPLETED':
				return (
					<span className={`${baseClasses} bg-purple-100 text-purple-800`}>
						<CheckCircle className="w-4 h-4 mr-1" />
						Completed
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

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md text-center">
					<XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
					<p className="text-gray-600">{error || 'Booking not found'}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Success/Cancel Messages */}
				{success && (
					<div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
						<div className="flex">
							<CheckCircle className="h-5 w-5 text-green-400" />
							<div className="ml-3">
								<h3 className="text-sm font-medium text-green-800">
									Payment Successful!
								</h3>
								<p className="mt-2 text-sm text-green-700">
									Your booking has been confirmed. You'll receive a confirmation email shortly.
								</p>
							</div>
						</div>
					</div>
				)}

				{canceled && (
					<div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
						<div className="flex">
							<AlertCircle className="h-5 w-5 text-yellow-400" />
							<div className="ml-3">
								<h3 className="text-sm font-medium text-yellow-800">
									Payment Cancelled
								</h3>
								<p className="mt-2 text-sm text-yellow-700">
									Your payment was cancelled. You can complete the payment below to confirm your booking.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Booking Details Card */}
				<div className="bg-white shadow-lg rounded-lg overflow-hidden">
					<div className="px-6 py-4 bg-blue-600 text-white">
						<h1 className="text-2xl font-bold">Booking Details</h1>
						<p className="text-blue-100">Booking #{booking.id}</p>
					</div>

					<div className="p-6">
						<div className="flex justify-between items-start mb-6">
							<h2 className="text-3xl font-bold text-gray-900">{booking.activity}</h2>
							{getStatusBadge(booking.status)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							{/* Date & Time */}
							<div className="space-y-4">
								<div className="flex items-center space-x-3">
									<Calendar className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-sm font-medium text-gray-500">Date</p>
										<p className="text-lg text-gray-900">{formatDate(booking.date)}</p>
									</div>
								</div>

								<div className="flex items-center space-x-3">
									<Clock className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-sm font-medium text-gray-500">Time</p>
										<p className="text-lg text-gray-900">
											{formatTime(booking.startTime)} - {formatTime(booking.endTime)}
										</p>
									</div>
								</div>
							</div>

							{/* People & Payment */}
							<div className="space-y-4">
								<div className="flex items-center space-x-3">
									<User className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-sm font-medium text-gray-500">Your Mate</p>
										<p className="text-lg text-gray-900">
											{booking.mate.firstName} {booking.mate.lastName}
										</p>
									</div>
								</div>

								<div className="flex items-center space-x-3">
									<DollarSign className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-sm font-medium text-gray-500">Total Amount</p>
										<p className="text-lg font-bold text-gray-900">
											${booking.totalAmount.toFixed(2)}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						{booking.status === 'PAYMENT_PENDING' && (
							<div className="border-t pt-6">
								<button
									onClick={handlePayment}
									className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2 font-medium"
								>
									<CreditCard className="h-5 w-5" />
									<span>Complete Payment</span>
								</button>
								<p className="text-sm text-gray-500 text-center mt-2">
									Secure payment powered by Stripe
								</p>
							</div>
						)}

						{booking.status === 'CONFIRMED' && (
							<div className="border-t pt-6">
								<div className="bg-green-50 border border-green-200 rounded-md p-4">
									<div className="flex">
										<CheckCircle className="h-5 w-5 text-green-400" />
										<div className="ml-3">
											<h3 className="text-sm font-medium text-green-800">
												Booking Confirmed
											</h3>
											<p className="mt-1 text-sm text-green-700">
												Your mate has been notified and will be ready for your activity.
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Booking Info */}
						<div className="border-t mt-6 pt-6">
							<div className="text-sm text-gray-500">
								<p>Booked by: {booking.renter.firstName} {booking.renter.lastName}</p>
								<p>Created: {new Date(booking.createdAt).toLocaleString()}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}