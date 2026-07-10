import type { NextAuthConfig } from "next-auth";

/** JWT sessions — Edge-safe constant (no Node/DB imports). */
export const SESSION_STRATEGY = "jwt" as const;

/**
 * Edge-compatible Auth.js config used by middleware.
 * Must not import `pg`, bcrypt, or any Node-only modules.
 * Credentials + DB live in `auth.ts` (Node runtime only).
 */
export const authConfig = {
  providers: [],
  session: { strategy: SESSION_STRATEGY },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.trustlineReady =
          (user as { trustlineReady?: boolean }).trustlineReady ?? false;
        token.tier = (user as { tier?: string }).tier ?? "solo";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.trustlineReady = Boolean(token.trustlineReady);
        session.user.tier = (token.tier as string) ?? "solo";
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
