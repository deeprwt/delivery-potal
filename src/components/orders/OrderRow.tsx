"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { OrderData, assignOrderToRider } from "@/lib/orderService";
import { TableRow, TableCell } from "../ui/table";

export interface RiderInfo {
  uid: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface OrderRowProps {
  order: OrderData & { id: string };
  role: "admin" | "rider";
  riderInfo: RiderInfo | null;

  onEdit: (order: OrderData & { id: string }) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderRow({
  order,
  role,
  riderInfo,
  onEdit,
  onDelete,
}: OrderRowProps) {
  const acquireOrder = async () => {
    if (!riderInfo) return;
    await assignOrderToRider(order.id, riderInfo);
    window.location.reload();
  };

  return (
    <TableRow className="border-b">
      <TableCell className="p-2">{order.orderNumber}</TableCell>
      <TableCell className="p-2">{order.customerName}</TableCell>
      <TableCell className="p-2">{order.customerPhone}</TableCell>
      <TableCell className="p-2">{order.pincode}</TableCell>
      <TableCell className="p-2">{order.productName}</TableCell>
      <TableCell className="p-2">{order.address}</TableCell>
      <TableCell className="p-2">{order.riderName}</TableCell>

      <TableCell className="p-2">
        <Badge color="info">{order.status}</Badge>
      </TableCell>

      <TableCell className="p-2">
        {order.deliveredAt
          ? new Date(order.deliveredAt.seconds * 1000).toLocaleDateString()
          : "—"}
      </TableCell>

      <TableCell className="p-2 space-x-2">
        {/* Rider Acquire Button */}
        {role === "rider" && order.status === "pending" && (
          <button
            onClick={acquireOrder}
            className="px-4 py-1 bg-green-600 text-white rounded"
          >
            Acquire
          </button>
        )}

        {/* Admin Buttons */}
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
      </TableCell>
    </TableRow>
  );
}
