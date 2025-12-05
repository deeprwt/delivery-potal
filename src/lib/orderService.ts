// lib/orders/orderService.ts

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// ---------------------------------------------------
// 🔥 ORDER TYPE
// ---------------------------------------------------

export interface OrderData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
    pincode: string; 
      secondaryPhone?: string;
  amountToCollect: number;
  productName: string;

  riderId?: string;
  riderName?: string;
  riderPhone?: string;

  status: "pending" | "assigned" | "picked" | "delivered" | "cancelled";

  assignedAt?: Timestamp;
  pickedAt?: Timestamp;
  deliveredAt?: Timestamp;

  pod?: {
    photos: string[];
    notes: string;
    time: Timestamp | null;
    location: {
      lat: number | null;
      lng: number | null;
    } | null;
  };

  createdAt?: Timestamp;
}

// ---------------------------------------------------
// 🟦 RIDER TYPE (NEW)
// ---------------------------------------------------

export interface RiderData {
  uid: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// ---------------------------------------------------
// 🟦 1: CREATE ORDER
// ---------------------------------------------------

export const createOrder = async (orderData: OrderData) => {
  const ref = collection(db, "orders");

  return await addDoc(ref, {
    ...orderData,
    status: "pending",
    pod: {
      photos: [],
      notes: "",
      time: null,
      location: null,
    },
    createdAt: Timestamp.now(),
  });
};

// ---------------------------------------------------
// 🟦 2: GET ORDER
// ---------------------------------------------------

export const getOrder = async (orderId: string) => {
  const ref = doc(db, "orders", orderId);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() as OrderData) : null;
};

// ---------------------------------------------------
// 🟦 3: ASSIGN ORDER TO RIDER (UPDATED)
// ---------------------------------------------------

export const assignOrderToRider = async (
  orderId: string,
  rider: RiderData
) => {
  const ref = doc(db, "orders", orderId);

  await updateDoc(ref, {
    riderId: rider.uid,
    riderName: `${rider.firstName} ${rider.lastName}`,
    riderPhone: rider.phone || "",
    status: "assigned",
    assignedAt: Timestamp.now(),
  });
};

// ---------------------------------------------------
// 🟦 4: MARK ORDER PICKED
// ---------------------------------------------------

export const markOrderPicked = async (orderId: string) => {
  const ref = doc(db, "orders", orderId);

  await updateDoc(ref, {
    status: "picked",
    pickedAt: Timestamp.now(),
  });
};

// ---------------------------------------------------
// 🟦 5: MARK ORDER DELIVERED
// ---------------------------------------------------

export const markOrderDelivered = async (orderId: string) => {
  const ref = doc(db, "orders", orderId);

  await updateDoc(ref, {
    status: "delivered",
    deliveredAt: Timestamp.now(),
  });
};

// ---------------------------------------------------
// 🟦 6: UPLOAD POD IMAGE
// ---------------------------------------------------

export const uploadPODImage = async (orderId: string, file: File) => {
  const storage = getStorage();
  const fileRef = ref(storage, `pod/${orderId}/${Date.now()}-${file.name}`);

  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

// ---------------------------------------------------
// 🟦 7: SUBMIT POD DETAILS
// ---------------------------------------------------

export const submitPOD = async (
  orderId: string,
  imageURL: string,
  notes: string,
  location?: { lat: number; lng: number }
) => {
  const ref = doc(db, "orders", orderId);

  await updateDoc(ref, {
    status: "delivered",
    deliveredAt: Timestamp.now(),
    "pod.photos": arrayUnion(imageURL),
    "pod.notes": notes || "",
    "pod.time": Timestamp.now(),
    "pod.location": location || null,
  });
};

// ---------------------------------------------------
// 🟦 8: GET RIDER STATS
// ---------------------------------------------------

export const getRiderStats = async (riderId: string) => {
  const ordersRef = collection(db, "orders");

  // Delivered
  const deliveredSnap = await getDocs(
    query(
      ordersRef,
      where("riderId", "==", riderId),
      where("status", "==", "delivered")
    )
  );

  // Picked
  const pickedSnap = await getDocs(
    query(
      ordersRef,
      where("riderId", "==", riderId),
      where("status", "==", "picked")
    )
  );

  // Active: assigned or picked
  const activeSnap = await getDocs(
    query(
      ordersRef,
      where("riderId", "==", riderId),
      where("status", "in", ["assigned", "picked"])
    )
  );

  return {
    delivered: deliveredSnap.size,
    picked: pickedSnap.size,
    active: activeSnap.size,
  };
};

export interface RiderStats {
  delivered: number;
  picked: number;
  active: number;
};

// ---------------------------------------------------
// 🟦 9: DELETE ORDER
// ---------------------------------------------------

export const deleteOrder = async (orderId: string): Promise<void> => {
  const ref = doc(db, "orders", orderId);
  await deleteDoc(ref);
};

// ---------------------------------------------------
// 🟦 10: UPDATE ORDER (Admin Edit)
// ---------------------------------------------------

export const updateOrder = async (
  orderId: string,
  data: Partial<OrderData>
): Promise<void> => {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, data);
};

