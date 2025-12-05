"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/getUser";
import { OrderData, uploadPODImage, submitPOD } from "@/lib/orderService";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RiderPODPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [orders, setOrders] = useState<(OrderData & { id: string })[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/signin");
      return;
    }

    (async () => {
      const profile = await getUserProfile(user.uid);

      if (profile?.role !== "rider") {
        router.push("/dashboard");
      } else {
        setAllowed(true);
        fetchAssignedOrders(user.uid);
      }
    })();
  }, []);

  // ---------------- FETCH ASSIGNED ORDERS ----------------
  const fetchAssignedOrders = async (riderId: string) => {
    const ref = collection(db, "orders");

    const q = query(
      ref,
      where("riderId", "==", riderId),
      where("status", "in", ["assigned", "picked"])
    );

    const snap = await getDocs(q);

    const data = snap.docs.map((d) => ({
      ...(d.data() as OrderData),
      id: d.id,
    }));

    setOrders(data);
  };

  // ---------------- SUBMIT POD ----------------
  const handleSubmitPOD = async (orderId: string, file: File) => {
    setUploading(orderId);

    // 1️⃣ Upload Image
    const url = await uploadPODImage(orderId, file);

    // 2️⃣ Submit POD details
    await submitPOD(orderId, url, notes[orderId] || "");

    // 3️⃣ Refresh list
    await fetchAssignedOrders(auth.currentUser!.uid);

    setUploading(null);
  };

  if (!allowed) return <p className="p-6">Loading POD page...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Submit POD</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders to submit POD.</p>
      ) : null}

      {orders.map((order) => (
        <div
          key={order.id}
          className="p-5 bg-white border rounded-xl shadow space-y-3"
        >
          <h3 className="text-lg font-semibold">
            Order #{order.orderNumber}
          </h3>

          <p>
            <strong>Name:</strong> {order.customerName}
          </p>

          <p>
            <strong>Phone:</strong> {order.customerPhone}
          </p>

          <p>
            <strong>Address:</strong> {order.address}
          </p>

          <p>
            <strong>Product:</strong> {order.productName}
          </p>

          {/* POD Notes */}
          <textarea
            placeholder="Add POD notes..."
            className="border w-full p-2 rounded"
            value={notes[order.id] || ""}
            onChange={(e) =>
              setNotes({ ...notes, [order.id]: e.target.value })
            }
          ></textarea>

          {/* Photo Upload */}
          <label className="block mt-2">
            <span className="text-sm font-medium">Upload POD Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) =>
                e.target.files &&
                handleSubmitPOD(order.id, e.target.files[0])
              }
              className="mt-2"
            />
          </label>

          {uploading === order.id && (
            <p className="text-blue-600 font-medium">Uploading...</p>
          )}
        </div>
      ))}
    </div>
  );
}
