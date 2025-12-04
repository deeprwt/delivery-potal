import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "CGB Solutions",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  // Redirect to /signup when visiting this page
  redirect("/signin");

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Empty because redirect happens */}
    </div>
  );
}
