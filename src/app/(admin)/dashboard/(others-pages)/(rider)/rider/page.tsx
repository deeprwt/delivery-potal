"use client";   // 🔥 REQUIRED for useEffect, useState, router

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/getUser";


export default function BasicTables() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/signin");
      return;
    }

    (async () => {
      const profile = await getUserProfile(user.uid);

      if (profile?.role !== "admin") {
        router.push("/dashboard");
      } else {
        setAllowed(true);
      }
    })();
  }, []);

  if (!allowed) return <p className="p-6">Checking access...</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Rider Table" />
      <div className="space-y-6">
        <ComponentCard title="Number of Rider">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
