"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./navbar";

type Booking = {
	id: string;
	activity: string;
	date: string;
	startTime: string;
	endTime: string;
	renter: {
		firstName: string;
		lastName: string;
	};
};

export default function MateHome({ userId }: { userId: string }) {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);

	useEffect(() => {
		async function fetchBookings() {
			const res = await fetch("/api/bookings?status=PENDING", { credentials: "include" });
			const data = await res.json();
			setBookings(data.bookings);
		}
		async function fetchConfirmedBooking() {
			const res = await fetch("/api/bookings?status=CONFIRMED", { credentials: "include" });
			if (res.ok) {
				const data = await res.json();
				setConfirmedBookings(data.bookings);
			}

		}
		try {
			fetchBookings();
			fetchConfirmedBooking();
		}
		catch (error) {

		}
	}, []);

	async function respond(id: string, action: "ACCEPT" | "REJECT") {
		await fetch(`/api/bookings/${id}/${action.toLowerCase()}`, {
			method: "POST",
			credentials: "include",
		});
		setBookings((prev) => prev.filter((b) => b.id !== id));
	}

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
			{bookings.map((b) => (
				<div key={b.id} className="border p-4 mb-4 rounded shadow">
					<p><strong>Activity:</strong> {b.activity}</p>
					<p><strong>Date:</strong> {new Date(b.date).toLocaleDateString()}</p>
					<p><strong>Time:</strong> {b.startTime} - {b.endTime}</p>
					<p><strong>From:</strong> {b.renter.firstName} {b.renter.lastName}</p>
					<div className="mt-2 space-x-2">
						<button onClick={() => respond(b.id, "ACCEPT")} className="bg-green-500 text-white px-3 py-1 rounded">Accept</button>
						<button onClick={() => respond(b.id, "REJECT")} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
					</div>
				</div>
			))}
			{confirmedBookings.length > 0 && (
				<div className="mt-8">
					<h2 className="text-2xl font-bold mb-4">Accepted Bookings</h2>
					{confirmedBookings.map((b) => (
						<div key={b.id} className="border rounded p-4 mb-3">
							<p><strong>Activity:</strong> {b.activity}</p>
							<p><strong>Date:</strong> {new Date(b.date).toLocaleDateString()}</p>
							<p><strong>Time:</strong> {b.startTime} - {b.endTime}</p>
							<p><strong>Renter:</strong> {b.renter.firstName} {b.renter.lastName}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
