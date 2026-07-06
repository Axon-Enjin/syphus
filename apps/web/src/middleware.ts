import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Not authenticated - redirect to login
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  // Onboard gate: if trustline not ready and not already on onboard page, redirect
  const isOnboardPage = pathname === "/dashboard/onboard";
  const trustlineReady = req.auth.user?.trustlineReady ?? false;

  if (!trustlineReady && !isOnboardPage) {
    return NextResponse.redirect(
      new URL("/dashboard/onboard", req.nextUrl.origin),
    );
  }

  // If trustline is ready and user visits onboard, let them through
  // (they might want to check their wallet info)
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
