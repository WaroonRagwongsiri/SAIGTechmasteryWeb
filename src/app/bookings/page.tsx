"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";

type Booking = {
	id: string;
	activity: string;
	date: string;
	startTime: string;
	endTime: string;
	totalAmount: number;
	renter: {
		firstName: string;
		lastName: string;
	};
};

const BookingList = () => {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);

	useEffect(() => {
		async function fetchBookings() {
			const res = await fetch("/api/bookings?status=PENDING", {
				credentials: "include",
			});
			const data = await res.json();
			setBookings(data.bookings);
		}
		async function fetchConfirmedBooking() {
			const res = await fetch("/api/bookings?status=CONFIRMED", {
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				setConfirmedBookings(data.bookings);
			}
		}
		try {
			fetchBookings();
			fetchConfirmedBooking();
		} catch (error) { }
	}, []);

	return (
		<div>
			<Navbar />
			<div className="p-4">
				<h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
				{bookings.map((b) => (
					<div key={b.id} className="border p-4 mb-4 rounded shadow">
						<p>
							<strong>Activity:</strong> {b.activity}
						</p>
						<p>
							<strong>Date:</strong> {new Date(b.date).toLocaleDateString()}
						</p>
						<p>
							<strong>Time:</strong> {b.startTime} - {b.endTime}
						</p>
						<p>
							<strong>From:</strong> {b.renter.firstName} {b.renter.lastName}
						</p>
					</div>
				))}
				{confirmedBookings.length > 0 && (
					<div className="mt-8">
						<h2 className="text-2xl font-bold mb-4">Accepted Bookings</h2>
						{confirmedBookings.map((b) => (
							<div key={b.id} className="border rounded p-4 mb-3">
								<p>
									<strong>Activity:</strong> {b.activity}
								</p>
								<p>
									<strong>Date:</strong> {new Date(b.date).toLocaleDateString()}
								</p>
								<p>
									<strong>Time:</strong> {b.startTime} - {b.endTime}
								</p>
								<p>
									<strong>Renter:</strong> {b.renter.firstName}{" "}
									{b.renter.lastName}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default BookingList;
