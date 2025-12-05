"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import {
  RiderWithStats,
  getAllRidersWithStats,
  toggleRiderStatus,
} from "@/lib/riderService";

import { useRouter } from "next/navigation";

export default function BasicTableOne() {
  const [riders, setRiders] = useState<RiderWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const loadData = async () => {
    const data = await getAllRidersWithStats();
    setRiders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------- SKELETON --------------------
  if (loading) {
    return (
      <div className="p-5 border rounded-xl animate-pulse border-gray-200 dark:border-white/[0.1]">
        <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  // ----------------- UI TABLE --------------------
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Rider</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Account Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Delivered</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Picked</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Active Orders</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {riders.map((rider) => (
                <TableRow key={rider.id}>
                  
                  {/* Rider Info */}
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          width={40}
                          height={40}
                          src={rider.photoURL || "/images/user/owner.jpg"}
                          alt="rider"
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {rider.firstName} {rider.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Rider</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">{rider.phone || "N/A"}</TableCell>

                  <TableCell className="px-4 py-3">
                    <Badge
                      size="sm"
                      color={
                        rider.accountStatus === "active"
                          ? "success"
                          : rider.accountStatus === "inactive"
                          ? "error"
                          : "warning"
                      }
                    >
                      {rider.accountStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3">{rider.delivered}</TableCell>
                  <TableCell className="px-4 py-3">{rider.picked}</TableCell>
                  <TableCell className="px-4 py-3">{rider.activeOrders}</TableCell>

                  {/* ---------------- ACTION BUTTONS ---------------- */}
                  <TableCell className="px-4 py-3 space-x-2">

                    {/* VIEW DETAILS BUTTON */}
                    <button
                      onClick={() => router.push(`/dashboard/rider/${rider.id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                    >
                      View Details
                    </button>

                    {/* ACTIVATE BUTTON */}
                    {rider.accountStatus !== "active" && (
                      <button
                        onClick={async () => {
                          await toggleRiderStatus(rider.id, "active");
                          loadData();
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Activate
                      </button>
                    )}

                    {/* DEACTIVATE BUTTON */}
                    {rider.accountStatus === "active" && (
                      <button
                        onClick={async () => {
                          await toggleRiderStatus(rider.id, "inactive");
                          loadData();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-red-600 px-4 py-3 text-sm font-medium text-white-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                      >
                        Deactivate
                      </button>
                    )}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
