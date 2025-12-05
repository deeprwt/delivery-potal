import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const authUser = request.cookies.get("authUser")?.value;
  const role = request.cookies.get("userRole")?.value;

  // Public page
  if (pathname.startsWith("/signin")) {
    return NextResponse.next();
  }

  // Not logged in
  if (!authUser) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // ADMIN PROTECTED ROUTES
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/rider/dashboard", request.url));
    }
  }

  // RIDER PROTECTED ROUTES
  if (pathname.startsWith("/rider")) {
    if (role !== "rider" && role !== "admin") {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/rider/:path*",
    "/dashboard/:path*", // optional
  ],
};
