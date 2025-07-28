"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { useAuthStore } from "@/stores/authStore"

const Navbar = () => {
	const router = useRouter()
	const { user,fetchUser, logout } = useAuthStore();

	useEffect(() => {
		if (!user) {
			fetchUser();
		}
	}, [user,fetchUser]);

	const handleLogout = async () => {
		logout()
	};

	return (
		<div className="flex items-center justify-between px-6 py-4 shadow-sm bg-white">
			{/* Left: Brand */}
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink href="/" className="text-xl font-semibold hover:underline">
							Rent a Mate
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>

			{/* Center: Navigation Links */}
			{user && (
				<NavigationMenu>
					<NavigationMenuList>
						{user.role === "RENTER" && (
							<NavigationMenuItem>
								<NavigationMenuLink
									href="/bookings"
									className="text-gray-700 hover:text-gray-900 hover:underline px-3 py-2 rounded-md text-sm font-medium"
								>
									My Bookings
								</NavigationMenuLink>
							</NavigationMenuItem>
						)}
					</NavigationMenuList>
				</NavigationMenu>
			)}

			{/* Right: Profile Dropdown using NavigationMenu */}
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Profile</NavigationMenuTrigger>
						<NavigationMenuContent className="p-4 w-56 overflow-auto right-0 left-auto">
							{user ? (
								<div className="space-y-2">
									<div>
										<p className="font-semibold">{user.firstName} {user.lastName}</p>
										<p className="text-xs text-muted-foreground">{user.email}</p>
									</div>
									<button
										className="w-full text-left text-sm hover:underline"
										onClick={() => router.push("/profile")}
									>
										My Profile
									</button>
									<button
										className="w-full text-left text-sm text-red-500 hover:underline"
										onClick={handleLogout}
									>
										Logout
									</button>
								</div>
							) : (
								<button
									className="w-full text-left text-sm hover:underline"
									onClick={() => router.push("/regis-login")}
								>
									Login / Register
								</button>
							)}
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	)
}

export default Navbar
