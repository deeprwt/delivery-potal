import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  photoURL?: string;
  role?: "admin" | "rider";
  createdAt?: Date;
  accountStatus?: "pending" | "active" | "inactive";
}

// 🔥 Auto-create user document if first login
export const createUserProfile = async (uid: string, data: UserData) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      ...data,
      createdAt: new Date(),
    });
  }
};

// 🔥 Read user profile
export const getUserProfile = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserData) : null;
};

// 🔥 Safe update (auto-create if missing)
export const updateUserProfile = async (uid: string, data: Partial<UserData>) => {
  const ref = doc(db, "users", uid);
  try {
    await updateDoc(ref, data);
  }catch (err) {
  console.error("Update failed, creating new doc:", err);
  await setDoc(ref, data, { merge: true });
}

};

// 🔥 Delete user profile
export const deleteUserProfile = async (uid: string) => {
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
};
