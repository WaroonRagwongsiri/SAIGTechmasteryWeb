"use client";
import React, { useEffect, useState } from "react";

type Mate = {
  id: string;
  userId: string;
  bio?: string;
  hourlyRate: number;
  user: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    dateOfBirth: string;
  };
};

export default function RenterHome({ userId }: { userId: string }) {
  const [mates, setMates] = useState<Mate[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchMates() {
      const res = await fetch(`/api/mates?query=${query}`, { credentials: "include" });
      const data = await res.json();
      setMates(data.mates);
    }
    fetchMates();
  }, [query]);

  const calcAge = (dob: string) => {
    const birth = new Date(dob);
    const age = new Date().getFullYear() - birth.getFullYear();
    return age;
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search by name or bio..."
        className="border p-2 mb-4 w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mates.map((mate) => (
          <div key={mate.id} className="border rounded p-4 shadow">
            <img src={mate.user.profilePhoto?.trim() || "https://placehold.co/600x400"} className="w-full h-40 object-cover rounded" />
            <h2 className="text-xl mt-2 font-bold">{mate.user.firstName} {mate.user.lastName}</h2>
            <p>Age: {calcAge(mate.user.dateOfBirth)}</p>
            <p className="text-gray-700">{mate.bio}</p>
            <p className="mt-2 text-green-600">฿{mate.hourlyRate}/hr</p>
            <a href={`/mate/${mate.id}`} className="mt-2 inline-block text-blue-500 underline">
              View Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
