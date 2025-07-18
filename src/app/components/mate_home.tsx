"use client";
import React, { useEffect, useState } from "react";

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

export default function MateHome({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function fetchBookings() {
      const res = await fetch("/api/bookings?status=PENDING", { credentials: "include" });
      const data = await res.json();
      setBookings(data.bookings);
    }
    fetchBookings();
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
    </div>
  );
}
