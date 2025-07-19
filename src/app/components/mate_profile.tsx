"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Import your supabase client
import { useRouter } from "next/navigation";
type MateProfileData = {
	bio?: string;
	hourlyRate: number;
	isAvailable: boolean;
	profilePhoto?: string;
};

const MateProfileForm = () => {
	const [profile, setProfile] = useState<MateProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);

	const router = useRouter();

	useEffect(() => {
		async function fetchProfile() {
			try {
				const res = await fetch("/api/mate-profile", { credentials: "include" });
				if (res.ok) {
					const data = await res.json();
					setProfile(data.profile); // assume server returns null if not found
				} else {
					setProfile(null);
				}
			} catch (err) {
				console.error(err);
				setProfile(null);
			} finally {
				setLoading(false);
			}
		}
		fetchProfile();
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		if (!profile) return;

		const target = e.target;
		const name = target.name;
		let value: string | number | boolean;

		if (target instanceof HTMLInputElement && target.type === "checkbox") {
			value = target.checked;
		} else if (target instanceof HTMLInputElement && target.type === "number") {
			value = parseFloat(target.value);
		} else {
			value = target.value;
		}

		setProfile((prev) => ({
			...prev!,
			[name]: value,
		}));
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			setUploading(true);

			if (!e.target.files || e.target.files.length === 0) {
				return;
			}

			const file = e.target.files[0];

			// Validate file type
			if (!file.type.startsWith('image/')) {
				alert('Please select an image file');
				return;
			}

			// Validate file size (5MB max)
			if (file.size > 5 * 1024 * 1024) {
				alert('File size must be less than 5MB');
				return;
			}

			// Create unique filename
			const fileExt = file.name.split('.').pop();
			const fileName = `mate-profiles/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

			// Upload to Supabase storage
			const { data, error } = await supabase.storage
				.from('photo-storage')
				.upload(fileName, file, {
					cacheControl: '3600',
					upsert: false
				});

			if (error) {
				console.error('Upload error:', error);

				if (error.message.includes('row-level security')) {
					alert('Upload failed: Please check storage permissions. You may need to configure Row Level Security policies in Supabase.');
				} else {
					alert(`Upload failed: ${error.message}`);
				}
				return;
			}

			// Get public URL
			const { data: publicUrlData } = supabase.storage
				.from('photo-storage')
				.getPublicUrl(fileName);

			// Update profile with the new photo URL
			setProfile((prev) => ({
				...prev!,
				profilePhoto: publicUrlData.publicUrl,
			}));

		} catch (error) {
			console.error('Error uploading file:', error);
			alert('Error uploading file. Please try again.');
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile) return;

		const res = await fetch("/api/mate-profile", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(profile),
		});

		if (res.ok) {
			alert("Profile saved!");
			router.push("/");
		} else {
			alert("Failed to save profile. Please try again.");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
				<span className="ml-2 text-gray-600">Loading...</span>
			</div>
		);
	}

	if (!profile) {
		// first time user — initialize empty profile
		return (
			<div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">Create Your Mate Profile</h2>
				<p className="text-gray-600 mb-6">
					Set up your profile to start receiving bookings as a companion.
				</p>
				<button
					onClick={() =>
						setProfile({
							bio: "",
							hourlyRate: 0,
							isAvailable: true,
							profilePhoto: ""
						})
					}
					className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium"
				>
					Create New Profile
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
			<h2 className="text-2xl font-bold text-gray-800 mb-6">Mate Profile</h2>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Profile Photo Section */}
				<div className="space-y-3">
					<label className="block text-sm font-medium text-gray-700">
						Profile Photo
					</label>

					{/* Current Photo Preview */}
					{profile.profilePhoto && (
						<div className="flex items-center space-x-4">
							<img
								src={profile.profilePhoto}
								alt="Profile"
								className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
							/>
							<span className="text-sm text-gray-600">Current photo</span>
						</div>
					)}

					{/* File Upload Input */}
					<div className="space-y-2">
						<input
							type="file"
							accept="image/*"
							onChange={handleFileUpload}
							disabled={uploading}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
						/>

						{uploading && (
							<div className="flex items-center text-sm text-gray-600">
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
								Uploading image...
							</div>
						)}

						{!uploading && profile.profilePhoto && (
							<div className="flex items-center text-sm text-green-600">
								<span className="mr-2">✓</span>
								Photo uploaded successfully
							</div>
						)}
					</div>
				</div>

				{/* Bio Section */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Bio
					</label>
					<textarea
						name="bio"
						placeholder="Tell potential clients about yourself, your interests, and what makes you a great companion..."
						value={profile.bio || ""}
						onChange={handleChange}
						rows={4}
						className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-vertical"
					/>
				</div>

				{/* Hourly Rate Section */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Hourly Rate ($)
					</label>
					<input
						type="number"
						name="hourlyRate"
						placeholder="25"
						value={profile.hourlyRate ?? ""}
						onChange={handleChange}
						min="0"
						step="0.01"
						className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
					/>
				</div>

				{/* Availability Section */}
				<div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
					<input
						type="checkbox"
						name="isAvailable"
						checked={profile.isAvailable}
						onChange={handleChange}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<div>
						<label className="text-sm font-medium text-gray-700">
							Available for booking
						</label>
						<p className="text-xs text-gray-500">
							Toggle this off if you're temporarily unavailable
						</p>
					</div>
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={uploading}
					className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{uploading ? "Uploading..." : "Save Profile"}
				</button>
			</form>
		</div>
	);
};

export default MateProfileForm;