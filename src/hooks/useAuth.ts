"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function useAuth() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr); // usr is already type User | null
      setLoading(false);

      if (!usr) {
        window.location.href = "/signin";
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
