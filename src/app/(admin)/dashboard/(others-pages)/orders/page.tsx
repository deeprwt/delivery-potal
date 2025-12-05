"use client";

import React, { useEffect, useState } from "react";
import OrdersUpload from "@/components/orders/OrdersUpload";
import OrdersTable from "@/components/orders/OrdersTable";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "@/lib/getUser";

export default function OrdersPageWrapper() {
  const [role, setRole] = useState<"admin" | "rider" | null>(null);
  const [loading, setLoading] = useState(true);

  const [riderInfo, setRiderInfo] = useState<{
    uid: string;
    firstName: string;
    lastName: string;
    phone?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole("rider"); // default
        setLoading(false);
        return;
      }

      const profile = await getUserProfile(user.uid);

      if (profile?.role === "admin") {
        setRole("admin");
      } else {
        setRole("rider");
        setRiderInfo({
          uid: user.uid,
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || "",
          phone: profile?.phone,
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-10">

      {/* 🔥 Admin ONLY Upload Excel */}
      {role === "admin" && <OrdersUpload role="admin" />}

      {/* 🔥 Both Admin and Rider see main orders list */}
      <OrdersTable role={role === "admin" ? "admin" : "rider"} riderInfo={riderInfo} />
    </div>
  );
}
