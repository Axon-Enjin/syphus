import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      trustlineReady: boolean;
      tier: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    trustlineReady: boolean;
    tier: string;
  }
}
