"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getUserProfile, createUserProfile, UserData } from "@/lib/getUser";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    photoURL: "/images/user/owner.jpg",
  });

  /* ---------------------- 1) Listen for Firebase Auth ---------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user); // user becomes available ONLY on client
    });
    return () => unsub();
  }, []);

  /* ---------------------- 2) Load Firestore Data ---------------------- */
  useEffect(() => {
    if (!firebaseUser) return; // run only when user exists

    (async () => {
      setLoading(true);

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
        photoURL: data?.photoURL ?? "/images/user/owner.jpg",
      });

      setLoading(false);
    })();
  }, [firebaseUser]);

  /* ---------------------- Handlers ---------------------- */
  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async () => {
    await signOut(auth);

    document.cookie = "authUser=; Max-Age=0; path=/;";
    document.cookie = "userRole=; Max-Age=0; path=/;";

    window.location.href = "/signin";
  };

  /* ---------------------- Skeleton While Loading ---------------------- */
  if (loading || !firebaseUser) {
    return (
      <div className="h-11 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
    );
  }

  /* ---------------------- UI ---------------------- */
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src={userData.photoURL || "/images/user/owner.jpg"}
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {userData.firstName || "User"}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* User Info */}
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {userData.firstName} {userData.lastName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {userData.email}
          </span>
        </div>

        {/* Menu */}
        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/dashboard/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Edit profile
            </DropdownItem>
          </li>
        </ul>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-600 rounded-lg text-theme-sm hover:bg-red-50 dark:hover:bg-white/5 dark:text-red-400"
        >
          Logout
        </button>
      </Dropdown>
    </div>
  );
}
