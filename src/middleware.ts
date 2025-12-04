import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("authUser");

  // Allow login page
  if (pathname.startsWith("/signin")) {
    return NextResponse.next();
  }

  // Block all protected routes
  if (!authCookie) {
    console.log("❌ Not logged in — redirecting");
    const signinUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signinUrl);
  }

  console.log("✅ Logged in — Access granted");
  return NextResponse.next();
}

// Protect routes
export const config = {
  matcher: [
    "/(admin)/:path*",
    "/dashboard/:path*",
    "/rider/:path*",
  ],
};
