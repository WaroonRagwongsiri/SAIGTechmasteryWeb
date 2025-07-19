"use client";
import React, { useEffect, useState } from "react";
import { useMatesStore } from "@/stores";

export default function RenterHome({ userId }: { userId: string }) {
  const [mates, setMates] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMates() {
      setLoading(true);
      const res = await fetch(`/api/mates?query=${query}&page=${page}&limit=10`, { credentials: "include" });
      const data = await res.json();
      if (page === 1) {
        setMates(data.mates);
      } else {
        setMates(prev => [...prev, ...data.mates]);
      }
      setHasMore(data.mates.length === 10);
      setLoading(false);
    }
    fetchMates();
  }, [query, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const calcAge = (dob: string) => {
    const birth = new Date(dob);
    const age = new Date().getFullYear() - birth.getFullYear();
    return age;
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  console.log(mates);

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

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center py-4">
          <button 
            onClick={loadMore}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}

      {!hasMore && mates.length > 0 && (
        <div className="text-center py-4 text-gray-600">
          No more mates available
        </div>
      )}
    </div>
  );
}
