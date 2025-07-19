"use client";
import React, { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, Calendar, User, DollarSign, ThumbsUp, ThumbsDown } from "lucide-react";

type Booking = {
	id: string;
	activity: string;
	date: string;
	startTime: string;
	endTime: string;
	totalAmount: number;
	status: string;
	renter: {
		firstName: string;
		lastName: string;
	};
};

export default function MateHome({ userId }: { userId: string }) {
	const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
	const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
	const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
	const [cancelledBookings, setCancelledBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAllBookings() {
			setLoading(true);
			try {
				// Fetch all bookings without status filter to get all statuses
				const res = await fetch("/api/bookings", {
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					const bookings = data.bookings;
					
					// Separate bookings by status
					setPendingBookings(bookings.filter((b: Booking) => b.status === 'PENDING'));
					setConfirmedBookings(bookings.filter((b: Booking) => b.status === 'CONFIRMED'));
					setCompletedBookings(bookings.filter((b: Booking) => b.status === 'COMPLETED'));
					setCancelledBookings(bookings.filter((b: Booking) => b.status === 'CANCELLED'));
				}
			} catch (error) {
				console.error("Error fetching bookings:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchAllBookings();
	}, []);

	async function respond(id: string, action: "ACCEPT" | "REJECT") {
		try {
			const res = await fetch(`/api/bookings/${id}/${action.toLowerCase()}`, {
				method: "POST",
				credentials: "include",
			});
			
			if (res.ok) {
				// Remove from pending bookings
				setPendingBookings((prev) => prev.filter((b) => b.id !== id));
				
				// If accepted, add to confirmed bookings
				if (action === "ACCEPT") {
					const pendingBooking = pendingBookings.find(b => b.id === id);
					if (pendingBooking) {
						const confirmedBooking = { ...pendingBooking, status: 'CONFIRMED' as const };
						setConfirmedBookings(prev => [...prev, confirmedBooking]);
					}
				}
			}
		} catch (error) {
			console.error("Error responding to booking:", error);
		}
	}

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
						<p className="text-sm font-medium text-gray-500">Renter</p>
						<p className="text-gray-900">
							{booking.renter.firstName} {booking.renter.lastName}
						</p>
					</div>
				</div>
				
				<div className="flex items-center space-x-3">
					<DollarSign className="h-5 w-5 text-gray-400" />
					<div>
						<p className="text-sm font-medium text-gray-500">Total Amount</p>
						<p className="text-gray-900 font-semibold">
							฿{booking.totalAmount.toFixed(2)}
						</p>
					</div>
				</div>
			</div>
			
			{booking.status === 'PENDING' && (
				<div className="mt-4 pt-4 border-t">
					<div className="flex space-x-3">
						<button 
							onClick={() => respond(booking.id, "ACCEPT")}
							className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
						>
							<ThumbsUp className="w-4 h-4 mr-2" />
							Accept
						</button>
						<button 
							onClick={() => respond(booking.id, "REJECT")}
							className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
						>
							<ThumbsDown className="w-4 h-4 mr-2" />
							Reject
						</button>
					</div>
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

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
				
				<BookingSection 
					title="Pending Requests" 
					bookings={pendingBookings}
					emptyMessage="No pending booking requests"
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
}
