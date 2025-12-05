"use client";

import React, { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getUserProfile,
  createUserProfile,
  UserData,
} from "@/lib/getUser";

export default function UserInfoCard() {
  const [loading, setLoading] = useState(true);

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    role: "rider",
  });

  /* -------------------------------------
     1) Listen to Auth State (FAST, CLIENT)
  --------------------------------------*/
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    return () => unsub();
  }, []);

  /* -------------------------------------
     2) Load Firestore User Data
  --------------------------------------*/
  useEffect(() => {
    if (!firebaseUser) return;

    (async () => {
      setLoading(true);

      // Create user if not exist
      await createUserProfile(firebaseUser.uid, {
        firstName: "",
        lastName: "",
        email: firebaseUser.email ?? "",
        phone: "",
        bio: "",
        photoURL: "/images/user/owner.jpg",
        role: "rider",
      });

      const data = await getUserProfile(firebaseUser.uid);

      setUserData({
        firstName: data?.firstName ?? "",
        lastName: data?.lastName ?? "",
        email: data?.email ?? firebaseUser.email ?? "",
        phone: data?.phone ?? "",
        bio: data?.bio ?? "",
        role: data?.role ?? "rider",
      });

      setLoading(false);
    })();
  }, [firebaseUser]);

  /* -------------------------------------
     3) Skeleton Loader
  --------------------------------------*/
  if (loading || !firebaseUser) {
    return (
      <div className="p-5 border rounded-2xl border-gray-200 dark:border-gray-800 animate-pulse">
        <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------
     4) UI Rendered
  --------------------------------------*/
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            
            {/* First Name */}
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">First Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.firstName || "N/A"}
              </p>
            </div>

            {/* Last Name */}
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Last Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.lastName || "N/A"}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email Address</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.email}
              </p>
            </div>

            {/* Phone */}
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.phone || "N/A"}
              </p>
            </div>

            {/* Bio */}
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Bio</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.bio || "N/A"}
              </p>
            </div>

          </div>
        </div>

        {/* Role Button */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Role: {userData.role || "rider"}
        </button>

      </div>
    </div>
  );
}
