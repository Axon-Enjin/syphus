import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  const isOnboardPage = pathname === "/dashboard/onboard";
  const trustlineReady = req.auth.user?.trustlineReady ?? false;

  if (!trustlineReady && !isOnboardPage) {
    return NextResponse.redirect(
      new URL("/dashboard/onboard", req.nextUrl.origin),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
