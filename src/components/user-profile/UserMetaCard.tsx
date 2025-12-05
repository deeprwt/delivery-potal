"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { User, onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  UserData,
} from "@/lib/getUser";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    photoURL: "/images/user/owner.jpg",
  });

  /* -------------------------------
     1) Listen to Auth User 
  --------------------------------*/
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsub();
  }, []);

  /* --------------------------------
     2) Load Profile from Firestore 
  ---------------------------------*/
  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      setLoading(true);

      await createUserProfile(currentUser.uid, {
        firstName: "",
        lastName: "",
        email: currentUser.email ?? "",
        phone: "",
        bio: "",
        photoURL: "/images/user/owner.jpg",
        role: "rider",
      });

      const data = await getUserProfile(currentUser.uid);

      setUserData({
        firstName: data?.firstName ?? "",
        lastName: data?.lastName ?? "",
        email: data?.email ?? currentUser.email ?? "",
        phone: data?.phone ?? "",
        bio: data?.bio ?? "",
        photoURL: data?.photoURL ?? "/images/user/owner.jpg",
      });

      setLoading(false);
    })();
  }, [currentUser]);

  /* -------------------------------
     3) Save Profile 
  --------------------------------*/
  const handleSave = async () => {
    if (!currentUser) return;

    await updateUserProfile(currentUser.uid, {
      ...userData,
      email: userData.email,
    });

    alert("Profile updated successfully!");
    closeModal();
  };

  /* -------------------------------
     4) Skeleton Loader 
  --------------------------------*/
  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl animate-pulse dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-3">
              <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-56 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-10 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------
     5) UI
  --------------------------------*/
  return (
    <>
      {/* PROFILE CARD */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex flex-col items-center gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border rounded-full">
              <Image
                width={80}
                height={80}
                src={userData.photoURL ?? "/images/user/owner.jpg"}
                alt="user"
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-center xl:text-left">
                {userData.firstName || "No First Name"} {userData.lastName || ""}
              </h4>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center xl:text-left">
                {userData.bio || "No bio added yet"}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center xl:text-left">
                {userData.email}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openModal}
              className="rounded-full border border-gray-300 bg-white px-4 py-3 text-sm hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="text-2xl font-semibold mb-4">
            Edit Personal Information
          </h4>

          <div className="space-y-4">
            <Label>First Name</Label>
            <Input
              value={userData.firstName}
              onChange={(e) =>
                setUserData({ ...userData, firstName: e.target.value })
              }
            />

            <Label>Last Name</Label>
            <Input
              value={userData.lastName}
              onChange={(e) =>
                setUserData({ ...userData, lastName: e.target.value })
              }
            />

            <Label>Email</Label>
            <Input value={userData.email} disabled />

            <Label>Phone</Label>
            <Input
              value={userData.phone}
              onChange={(e) =>
                setUserData({ ...userData, phone: e.target.value })
              }
            />

            <Label>Bio</Label>
            <Input
              value={userData.bio}
              onChange={(e) =>
                setUserData({ ...userData, bio: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
