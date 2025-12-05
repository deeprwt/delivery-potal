import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { UserData } from "@/lib/getUser";
import { OrderData } from "./orderService";
import { getRiderStats } from "./orderService"; // ✅ FIXED IMPORT

export const getRiderDetails = async (riderId: string) => {
  const ref = doc(db, "users", riderId);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() as UserData) : null;
};

export const getRiderOrders = async (riderId: string) => {
  const ref = collection(db, "orders");
  const snap = await getDocs(query(ref, where("riderId", "==", riderId)));

  const orders: (OrderData & { id: string })[] = [];
  snap.forEach((doc) => orders.push({ ...(doc.data() as OrderData), id: doc.id }));

  return orders;
};

export const getRiderFullData = async (riderId: string) => {
  const rider = await getRiderDetails(riderId);
  const stats = await getRiderStats(riderId);
  const orders = await getRiderOrders(riderId);

  return { rider, stats, orders };
};
