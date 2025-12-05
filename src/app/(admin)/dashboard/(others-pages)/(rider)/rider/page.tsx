import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Rider Name",
  description:
    "This rider dashboard",
  // other metadata
};

export default function BasicTables() {
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
