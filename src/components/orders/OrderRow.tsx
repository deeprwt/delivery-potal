"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { OrderData, assignOrderToRider } from "@/lib/orderService";

interface OrderRowProps {
  order: OrderData & { id: string };
  role: "admin" | "rider";
  riderInfo: {
    uid: string;
    firstName: string;
    lastName: string;
    phone?: string;
  } | null;

  onEdit: (order: OrderData & { id: string }) => void;   // NEW
  onDelete: (orderId: string) => void;                   // NEW
}

export default function OrderRow({ order, role, riderInfo, onEdit, onDelete }: OrderRowProps) {
  const acquireOrder = async () => {
    if (!riderInfo) return;
    await assignOrderToRider(order.id, riderInfo);
    window.location.reload();
  };

  return (
    <tr className="border-b">
      <td className="p-2">{order.orderNumber}</td>
      <td className="p-2">{order.customerName}</td>
      <td className="p-2">{order.customerPhone}</td>
      <td className="p-2">{order.pincode}</td>
      <td className="p-2">{order.productName}</td>
      <td className="p-2">{order.address}</td>

      <td className="p-2">
        <Badge color="info">{order.status}</Badge>
      </td>

      <td className="p-2">
        {order.deliveredAt
          ? new Date(order.deliveredAt.seconds * 1000).toLocaleDateString()
          : "—"}
      </td>

      <td className="p-2 space-x-2">
        {role === "rider" && order.status === "pending" && (
          <button onClick={acquireOrder} className="px-4 py-1 bg-green-600 text-white rounded">
            Acquire
          </button>
        )}

        {role === "admin" && (
          <>
            <button
              onClick={() => onEdit(order)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(order.id)}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
