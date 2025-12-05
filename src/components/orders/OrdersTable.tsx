"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import Pagination from "@/components/tables/Pagination";
import OrderRow from "./OrderRow";
import { OrderData } from "@/lib/orderService";
import { deleteOrder, updateOrder } from "@/lib/orderService"; // <-- add update/delete service

interface OrdersTableProps {
  role: "admin" | "rider";
  riderInfo: {
    uid: string;
    firstName: string;
    lastName: string;
    phone?: string;
  } | null;
}

export default function OrdersTable({ role, riderInfo }: OrdersTableProps) {
  const [orders, setOrders] = useState<(OrderData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const [totalPages, setTotalPages] = useState(1);

  /* ----------------------------------
      MODAL STATES (must be outside tbody)
  ---------------------------------- */
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] =
    useState<(OrderData & { id: string }) | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ===========================
      1️⃣ TOTAL COUNT
     =========================== */
  const getTotalOrdersCount = async () => {
    const snap = await getDocs(collection(db, "orders"));
    setTotalPages(Math.ceil(snap.size / pageSize));
  };

  /* ===========================
      2️⃣ FETCH ORDERS
     =========================== */
  const fetchOrders = async (page: number) => {
    setLoading(true);

    const ref = collection(db, "orders");
    let q;

    if (role === "rider") {
      q = query(
        ref,
        where("status", "==", "pending"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      if (page === 1) {
        q = query(ref, orderBy("createdAt", "desc"), limit(pageSize));
      } else {
        q = query(
          ref,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }
    }

    const snap = await getDocs(q);

    const fetchedOrders = snap.docs.map((d) => ({
      ...(d.data() as OrderData),
      id: d.id,
    }));

    setOrders(fetchedOrders);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setLoading(false);
  };

  /* ===========================
      3️⃣ FIRST LOAD
     =========================== */
  useEffect(() => {
    getTotalOrdersCount();
  }, []);

  /* ===========================
      4️⃣ FETCH ON PAGE CHANGE
     =========================== */
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, role]);

  /* ===========================
      5️⃣ LOADING
     =========================== */
  if (loading)
    return (
      <div className="p-6 bg-white shadow rounded-xl">
        <p className="text-gray-600">Loading orders…</p>
      </div>
    );

  /* ===========================
      6️⃣ RENDER TABLE
     =========================== */
  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4">
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Order #</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Pincode</th>
            <th className="p-2">Product</th>
            <th className="p-2">Address</th>
            <th className="p-2">Status</th>
            <th className="p-2">Delivery</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              role={role}
              riderInfo={riderInfo}
              onEdit={(o) => {
                setEditData(o);
                setEditModal(true);
              }}
              onDelete={(id) => {
                setDeleteId(id);
                setDeleteModal(true);
              }}
            />
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* =======================
         EDIT MODAL (outside table)
        ======================= */}
      {editModal && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[450px] space-y-4">
            <h3 className="text-lg font-semibold">Edit Order</h3>

            <input
              value={editData.customerName}
              onChange={(e) =>
                setEditData({ ...editData, customerName: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              value={editData.customerPhone}
              onChange={(e) =>
                setEditData({ ...editData, customerPhone: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              value={editData.productName}
              onChange={(e) =>
                setEditData({ ...editData, productName: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                className="px-5 py-2 bg-blue-600 text-white rounded"
                onClick={async () => {
                  await updateOrder(editData.id, editData);
                  setEditModal(false);
                  fetchOrders(currentPage);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================
         DELETE MODAL
        ======================= */}
      {deleteModal && deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h3 className="text-lg font-semibold">Confirm Delete</h3>

            <p>Are you sure you want to delete this order?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await deleteOrder(deleteId);
                  setDeleteModal(false);
                  fetchOrders(currentPage);
                }}
                className="px-5 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
