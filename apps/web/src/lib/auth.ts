import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "@gig-payout/db";
import { getDb, users, wallets } from "@gig-payout/db";
import { z } from "zod";
import { getTrustlineReadyForUser, SESSION_STRATEGY } from "./auth-helpers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);

        if (!user) return null;
        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        const [userRow] = await db
          .select({ trustlineReady: wallets.trustlineReady, tier: users.tier })
          .from(wallets)
          .innerJoin(users, eq(wallets.userId, users.id))
          .where(eq(wallets.userId, user.id))
          .limit(1);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          trustlineReady: userRow?.trustlineReady ?? false,
          tier: userRow?.tier ?? "solo",
        };
      },
    }),
  ],
  session: { strategy: SESSION_STRATEGY },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.trustlineReady =
          (user as { trustlineReady?: boolean }).trustlineReady ?? false;
        token.tier = (user as { tier?: string }).tier ?? "solo";
      }
      if (trigger === "update" && token.sub) {
        token.trustlineReady = await getTrustlineReadyForUser(token.sub);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.trustlineReady = token.trustlineReady as boolean;
        session.user.tier = (token.tier as string) ?? "solo";
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
