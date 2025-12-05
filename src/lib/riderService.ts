import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getRiderStats } from "./orderService";   // ✅ Correct import
import { UserData } from "./getUser";

export interface RiderWithStats extends UserData {
  id: string;
  delivered: number;
  picked: number;
  activeOrders: number;
}

export const getAllRidersWithStats = async (): Promise<RiderWithStats[]> => {
  const ridersRef = collection(db, "users");
  const snap = await getDocs(query(ridersRef, where("role", "==", "rider")));

  const riders: RiderWithStats[] = [];

  for (const docSnap of snap.docs) {
    const rider = docSnap.data() as UserData;

    const stats = await getRiderStats(docSnap.id);

    riders.push({
      ...rider,
      id: docSnap.id,
      delivered: stats.delivered,
      picked: stats.picked,
      activeOrders: stats.active,
    });
  }

  return riders;
};

// Toggle active / inactive
export const toggleRiderStatus = async (riderId: string, status: "active" | "inactive") => {
  const ref = doc(db, "users", riderId);
  await updateDoc(ref, { accountStatus: status });
};
