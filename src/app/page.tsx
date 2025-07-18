"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import RenterHome from "./components/renter_home";
import MateHome from "./components/mate_home";

type User = {
  id: string;
  role: "RENTER" | "MATE";
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) return <div className="flex h-screen justify-center items-center text-center">Loading...</div>;
  if (!user) return <div className="flex h-screen justify-center items-center text-center">Please login</div>;

  return (
    <div>
      <Navbar />
      {user.role === "RENTER" ? <RenterHome userId={user.id} /> : <MateHome userId={user.id} />}
    </div>
  );
}
