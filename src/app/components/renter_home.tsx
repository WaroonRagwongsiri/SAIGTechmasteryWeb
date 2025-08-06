"use client";
import React, { useEffect, useState } from "react";
import { useMatesStore } from "@/stores";

export default function RenterHome({ userId }: { userId: string }) {
	const [query, setQuery] = useState("");
	const {
		mates,
		fetchMates,
		loadMoreMates,
		loading,
		hasMore,
		minRate,
		maxRate,
		minRating,
		setRateRange,
		setMinRating,
	} = useMatesStore();

	useEffect(() => {
		fetchMates(query, true);
	}, [query]);

	useEffect(() => {
		fetchMates(query, true);
	}, [minRate, maxRate]);

	useEffect(() => {
		fetchMates(query, true);
	}, [setMinRating]);

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
			<div className="flex gap-4 mb-4">
				<input
					type="number"
					placeholder="Min rate"
					className="border p-2 w-full"
					onChange={(e) => setRateRange(Number(e.target.value) || 0, maxRate)}
				/>
				<input
					type="number"
					placeholder="Max rate"
					className="border p-2 w-full"
					onChange={(e) =>
						setRateRange(minRate, Number(e.target.value) || Infinity)
					}
				/>
				<input
					type="number"
					placeholder="Min rating"
					className="border p-2 w-full"
					onChange={(e) => setMinRating(Number(e.target.value) || 0)}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{mates.map((mate) => (
					<div key={mate.id} className="border rounded p-4 shadow">
						<img
							src={
								mate.user.profilePhoto?.trim() || "https://placehold.co/600x400"
							}
							className="w-full h-40 object-cover rounded"
						/>
						<h2 className="text-xl mt-2 font-bold">
							{mate.user.firstName} {mate.user.lastName}
						</h2>
						<p>Age: {calcAge(mate.user.dateOfBirth)}</p>
						<p className="text-gray-700">{mate.bio}</p>
						<p className="mt-2 text-green-600">฿{mate.hourlyRate}/hr</p>
						<p className="text-gray-700 leading-relaxed">
							⭐{mate.rating.toFixed(2) || 0.00.toFixed(2)} / 5.00
						</p>
						<a
							href={`/mate/${mate.id}`}
							className="mt-2 inline-block text-blue-500 underline"
						>
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
						onClick={loadMoreMates}
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
