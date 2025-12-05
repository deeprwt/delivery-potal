"use client";

import React, { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { OrderData, assignOrderToRider } from "@/lib/orderService";

type OrderWithId = OrderData & { id: string };

export default function RiderAcquireOrders() {
  const [orders, setOrders] = useState<OrderWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "orders"), where("status", "==", "pending")));
      const data = snap.docs.map((d) => ({ ...(d.data() as OrderData), id: d.id }));
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const acquire = async (order: OrderWithId) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in!");
      return;
    }

    // Build RiderData using available user metadata
    const displayName = user.displayName ?? "";
    const [firstName, ...rest] = displayName.split(" ");
    const lastName = rest.join(" ");

    const rider = {
      uid: user.uid,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      phone: user.phoneNumber ?? "",
    };

    await assignOrderToRider(order.id, rider);
    alert("Order acquired");
    await load();
  };

  if (loading) {
    return <div className="p-4">Loading available orders...</div>;
  }

  return (
    <div className="p-5 bg-white rounded-xl shadow">
      <h3 className="text-lg mb-4 font-semibold">Available Orders</h3>

      {orders.length === 0 && <p>No available orders.</p>}

      {orders.map((o) => (
        <div key={o.id} className="border p-4 rounded mb-3">
          <p><b>{o.customerName}</b></p>
          <p>{o.address}</p>
          <p>Product: {o.productName}</p>

          <button
            onClick={() => void acquire(o)}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Acquire Order
          </button>
        </div>
      ))}
    </div>
  );
}
