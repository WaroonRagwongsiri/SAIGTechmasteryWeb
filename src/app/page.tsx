"use client";
import React, { useEffect } from "react";
import Navbar from "./components/navbar";
import RenterHome from "./components/renter_home";
import MateHome from "./components/mate_home";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const { user, loading, error, fetchUser } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		if (error)
		{
			router.push("/regis-login");
		}
		if (!user) {
			fetchUser();
		}
	}, [user, loading, error, fetchUser]);

	if (error)
	{
		router.push("/regis-login");
		return (<div></div>)
	}
	if (loading) return <div className="flex h-screen justify-center items-center text-center">Loading...</div>;
	if (!user) return <div><Navbar /><div className="flex h-full justify-center items-center text-center">Please login</div></div>;

	return (
		<div>
			<Navbar />
			{user.role === "RENTER" ? <RenterHome userId={user.id} /> : <MateHome userId={user.id} />}
		</div>
	);
}
