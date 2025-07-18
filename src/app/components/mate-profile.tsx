"use client";

import React, { useEffect, useState } from "react";

type MateProfileData = {
  bio?: string;
  hourlyRate: number;
  isAvailable: boolean;
};

const MateProfileForm = () => {
  const [profile, setProfile] = useState<MateProfileData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const res = await fetch("/api/mate-profile", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) alert("Profile saved!");
  };

  if (loading) return <div>Loading...</div>;

  if (!profile) {
    // first time user — initialize empty profile
    return (
      <button
        onClick={() =>
          setProfile({ bio: "", hourlyRate: 0, isAvailable: true })
        }
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Create New Profile
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <textarea
        name="bio"
        placeholder="Bio"
        value={profile.bio || ""}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        name="hourlyRate"
        placeholder="Hourly Rate"
        value={profile.hourlyRate ?? ""}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isAvailable"
          checked={profile.isAvailable}
          onChange={handleChange}
        />
        <span>Available for booking</span>
      </label>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </form>
  );
};

export default MateProfileForm;
