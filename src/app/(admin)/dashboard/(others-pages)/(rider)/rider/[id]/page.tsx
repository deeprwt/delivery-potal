"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";

import { getRiderFullData } from "@/lib/riderDetailsService";
import { UserData } from "@/lib/getUser";
import { OrderData, RiderStats } from "@/lib/orderService";
import Pagination from "@/components/tables/Pagination";

export default function RiderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [rider, setRider] = useState<UserData | null>(null);
  const [stats, setStats] = useState<RiderStats | null>(null);

  const [orders, setOrders] = useState<(OrderData & { id: string })[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  useEffect(() => {
    (async () => {
      if (!id) return;

      const data = await getRiderFullData(id);

      setRider(data.rider);
      setStats(data.stats);
      setOrders(data.orders);
      setLoading(false);
    })();
  }, [id]);

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="p-6 space-y-10 animate-pulse">
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
        <div className="grid grid-cols-3 gap-6">
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  if (!rider || !stats) return <p>Rider not found</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Rider Header */}
      <div className="flex items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
        <Image
          width={90}
          height={90}
          src={rider.photoURL || "/images/user/owner.jpg"}
          alt="rider"
          className="rounded-full"
        />

        <div>
          <h2 className="text-xl font-semibold">
            {rider.firstName} {rider.lastName}
          </h2>

          <p className="text-gray-500">{rider.phone}</p>

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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p className="text-gray-500">Delivered</p>
          <h3 className="text-xl font-semibold">{stats.delivered}</h3>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p className="text-gray-500">Picked</p>
          <h3 className="text-xl font-semibold">{stats.picked}</h3>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p className="text-gray-500">Active Orders</p>
          <h3 className="text-xl font-semibold">{stats.active}</h3>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Orders History</h3>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Order #</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Status</th>
              <th className="py-2">POD</th>
            </tr>
          </thead>

          <tbody>
            {currentOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-2">{order.orderNumber}</td>
                <td className="py-2">{order.customerName}</td>
                <td className="py-2">
                  <Badge color="info">{order.status}</Badge>
                </td>

                <td className="py-2 flex gap-2">
                  {order.pod?.photos?.length ? (
                    order.pod.photos.map((img, index) => (
                      <Image
                        key={index}
                        src={img}
                        width={50}
                        height={50}
                        alt="POD"
                        className="rounded cursor-pointer hover:opacity-80"
                        onClick={() => setModalImage(img)}
                      />
                    ))
                  ) : (
                    <span className="text-gray-500">No POD</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(orders.length / ordersPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* POD Modal */}
      <Modal isOpen={!!modalImage} onClose={() => setModalImage(null)}>
        <div className="p-4 flex justify-center">
          {modalImage && (
            <Image
              src={modalImage}
              width={600}
              height={600}
              alt="Full POD"
              className="rounded-xl"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
