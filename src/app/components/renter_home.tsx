"use client";
import React, { useEffect } from "react";
import { useMatesStore } from "@/stores";

export default function RenterHome({ userId }: { userId: string }) {
	const {
		mates,
		fetchMates,
		loadMoreMates,
		loading,
		hasMore,
		searchQuery,
		setSearchQuery,
	} = useMatesStore();

	// Fetch mates on query change
	useEffect(() => {
		fetchMates(searchQuery, true); // fetch on mount

		return () => {
			// Clean up when leaving page
			useMatesStore.getState().clearMates();
		};
	}, []);


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
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{mates.map((mate) => (
					<div key={mate.id} className="border rounded p-4 shadow">
						<img
							src={mate.user.profilePhoto?.trim() || "https://placehold.co/600x400"}
							className="w-full h-40 object-cover rounded"
						/>
						<h2 className="text-xl mt-2 font-bold">
							{mate.user.firstName} {mate.user.lastName}
						</h2>
						<p>Age: {calcAge(mate.user.dateOfBirth)}</p>
						<p className="text-gray-700">{mate.bio}</p>
						<p className="mt-2 text-green-600">฿{mate.hourlyRate}/hr</p>
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
