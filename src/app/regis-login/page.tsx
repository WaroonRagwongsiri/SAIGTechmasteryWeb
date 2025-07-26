"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { useAuthStore } from "@/stores/authStore";

const AuthPage = () => {
	const router = useRouter();
	const {login} = useAuthStore();
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "RENTER",
		dateOfBirth: "",
		profilePhoto: "https://placehold.co/600x400", // default profile photo
	});

	const handleInputChange = (e: { target: { name: any; value: any } }) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isLogin) {
			if (formData.password !== formData.confirmPassword) {
				alert("Passwords do not match");
				return;
			}

			const dob = new Date(formData.dateOfBirth);
			const today = new Date();
			const age = today.getFullYear() - dob.getFullYear();
			const m = today.getMonth() - dob.getMonth();
			const ageIsValid =
				m < 0 || (m === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
			if (ageIsValid < 18) {
				alert("You must be at least 18 years old to register.");
				return;
			}

			try {
				const res = await fetch("/api/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				});

				const data = await res.json();

				if (!res.ok) {
					alert(data.error || "Something went wrong.");
					return;
				}

				alert("Registered successfully!");
				setIsLogin(true); // switch to login form
			} catch (err) {
				alert("Network error.");
			}
		} else {
			try {
				const res = await fetch("/api/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: formData.email,
						password: formData.password,
					}),
				});

				const data = await res.json();

				if (!res.ok) {
					alert(data.error || "Login failed.");
					return;
				}

				localStorage.setItem("token", data.token);

				login()
				router.push("/");
			} catch (err) {
				alert(err);
			}
		}
	};

	const toggleAuthMode = () => {
		setIsLogin(!isLogin);
		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			role: "RENTER",
			dateOfBirth: "",
			profilePhoto: "",
		});
	};

	return (
		<div>
			{/* Custom Nav */}
			<div className="flex items-center justify-between px-6 py-4 shadow-sm bg-white w-full">
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuLink href="/" className="text-xl font-semibold hover:underline">
								Rent a Mate
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
			<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
							<span className="text-white text-2xl">💜</span>
						</div>
						<h1 className="text-3xl font-bold text-gray-800 mb-2">Rent a Mate</h1>
						<p className="text-gray-600">
							{isLogin ? "Welcome back!" : "Join our community today"}
						</p>
					</div>

					{/* Main Card */}
					<div className="bg-white rounded-2xl shadow-xl p-8">
						{/* Toggle Buttons */}
						<div className="flex bg-gray-100 rounded-lg p-1 mb-6">
							<button
								onClick={() => setIsLogin(true)}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isLogin
									? "bg-white text-purple-600 shadow-sm"
									: "text-gray-500 hover:text-gray-700"
									}`}
							>
								Login
							</button>
							<button
								onClick={() => setIsLogin(false)}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isLogin
									? "bg-white text-purple-600 shadow-sm"
									: "text-gray-500 hover:text-gray-700"
									}`}
							>
								Register
							</button>
						</div>

						<div className="space-y-4">
							{/* Registration Fields */}
							{!isLogin && (
								<>
									<div className="grid grid-cols-2 gap-4">
										{/* First Name */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												First Name
											</label>
											<input
												type="text"
												name="firstName"
												value={formData.firstName}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
												placeholder="John"
												required
											/>
										</div>
										{/* Last Name */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Last Name
											</label>
											<input
												type="text"
												name="lastName"
												value={formData.lastName}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
												placeholder="Doe"
												required
											/>
										</div>
									</div>

									{/* Role */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											I want to be a
										</label>
										<select
											name="role"
											value={formData.role}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
										>
											<option value="RENTER">
												Renter - I want to hire companions
											</option>
											<option value="MATE">
												Mate - I want to be a companion
											</option>
										</select>
									</div>

									{/* Date of Birth */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Date of Birth
										</label>
										<input
											type="date"
											name="dateOfBirth"
											value={formData.dateOfBirth}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
											required
										/>
									</div>
								</>
							)}

							{/* Email */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email Address
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="john@example.com"
									required
								/>
							</div>

							{/* Password */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										className="w-full px-3 py-2 pr-10 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="••••••••"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showPassword ? "🙈" : "👁️"}
									</button>
								</div>
							</div>

							{/* Confirm Password - Registration Only */}
							{!isLogin && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Confirm Password
									</label>
									<input
										type="password"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="••••••••"
										required
									/>
								</div>
							)}

							{/* Submit Button */}
							<button
								type="button"
								onClick={handleSubmit}
								className="w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all"
							>
								{isLogin ? "Sign In" : "Create Account"}
							</button>
						</div>

						{/* Footer */}
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								{isLogin ? "Don't have an account?" : "Already have an account?"}
								<button
									onClick={toggleAuthMode}
									className="ml-1 text-purple-600 hover:text-purple-800 font-medium"
								>
									{isLogin ? "Sign up" : "Sign in"}
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
