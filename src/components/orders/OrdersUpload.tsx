"use client";

import React, { useState } from "react";
import { parseExcel } from "@/lib/excelParser";
import { OrderData, createOrder } from "@/lib/orderService";

interface OrdersUploadProps {
  role: "admin" | "rider";
}

export default function OrdersUpload({ role }: OrdersUploadProps) {
  const [excelOrders, setExcelOrders] = useState<OrderData[]>([]);
  const [saving, setSaving] = useState(false);

  // Hide component for rider
  if (role !== "admin") return null;

  /* ============================
      UPLOAD EXCEL FILE
  ============================ */
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = await parseExcel(file);
    setExcelOrders(parsed);
  };

  /* ============================
      DELETE A ROW
  ============================ */
  const deleteRow = (index: number) => {
    const updated = excelOrders.filter((_, i) => i !== index);
    setExcelOrders(updated);
  };

  /* ============================
      UPDATE A ROW (Inline Edit)
  ============================ */
  const updateField = (
    index: number,
    field: keyof OrderData,
    value: string | number
  ) => {
    const updated = [...excelOrders];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setExcelOrders(updated);
  };

  /* ============================
      SAVE ALL ORDERS TO FIRESTORE
  ============================ */
  const saveAllOrders = async () => {
    if (excelOrders.length === 0) return;

    setSaving(true);

    for (const order of excelOrders) {
      await createOrder(order);
    }

    setSaving(false);
    setExcelOrders([]);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      <h2 className="text-xl font-semibold">Upload Excel Orders</h2>

      {/* Upload Excel */}
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleExcelUpload}
        className="border p-2 rounded"
      />

      {/* Show Save Button */}
      {excelOrders.length > 0 && (
        <button
          onClick={saveAllOrders}
          disabled={saving}
          className="px-5 py-2 bg-green-600 text-white rounded disabled:bg-green-400"
        >
          {saving ? "Saving..." : `Save ${excelOrders.length} Orders`}
        </button>
      )}

      {/* Preview Table */}
      {excelOrders.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-lg font-medium mb-3">Preview & Edit</h3>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Order #</th>
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Secondary</th>
                <th className="p-2">Address</th>
                <th className="p-2">Pincode</th>
                <th className="p-2">Product</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {excelOrders.map((order, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <input
                      value={order.orderNumber}
                      onChange={(e) =>
                        updateField(index, "orderNumber", e.target.value)
                      }
                      className="border p-1 rounded w-28"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      value={order.customerName}
                      onChange={(e) =>
                        updateField(index, "customerName", e.target.value)
                      }
                      className="border p-1 rounded w-32"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      value={order.customerPhone}
                      onChange={(e) =>
                        updateField(index, "customerPhone", e.target.value)
                      }
                      className="border p-1 rounded w-28"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      value={order.secondaryPhone || ""}
                      onChange={(e) =>
                        updateField(index, "secondaryPhone", e.target.value)
                      }
                      className="border p-1 rounded w-28"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      value={order.address}
                      onChange={(e) =>
                        updateField(index, "address", e.target.value)
                      }
                      className="border p-1 rounded w-64"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      value={order.pincode}
                      onChange={(e) =>
                        updateField(index, "pincode", e.target.value)
                      }
                      className="border p-1 rounded w-20"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      value={order.productName}
                      onChange={(e) =>
                        updateField(index, "productName", e.target.value)
                      }
                      className="border p-1 rounded w-32"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      value={order.amountToCollect}
                      onChange={(e) =>
                        updateField(index, "amountToCollect", Number(e.target.value))
                      }
                      className="border p-1 rounded w-20"
                    />
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => deleteRow(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
