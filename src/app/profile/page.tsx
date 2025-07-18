"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import MateProfileForm from "../components/mate-profile";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div>
        <Navbar />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <h1 className="text-2xl font-bold my-4">
        Welcome, {user.firstName} {user.lastName}
      </h1>

      {user.role === "MATE" ? (
        <MateProfileForm />
      ) : (
        <p>You are a RENTER. No mate profile to edit.</p>
      )}
    </div>
  );
};

export default ProfilePage;
