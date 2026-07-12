import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "@syphus/db";
import { getDb, users, wallets } from "@syphus/db";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { getTrustlineReadyForUser } from "./auth-helpers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.trustlineReady =
          (user as { trustlineReady?: boolean }).trustlineReady ?? false;
        token.tier = (user as { tier?: string }).tier ?? "solo";
      }
      // Session update (Node only) — prefer explicit payload, else refresh from DB
      if (trigger === "update") {
        const payload = session as { trustlineReady?: boolean } | undefined;
        if (typeof payload?.trustlineReady === "boolean") {
          token.trustlineReady = payload.trustlineReady;
        } else if (token.sub) {
          token.trustlineReady = await getTrustlineReadyForUser(token.sub);
        }
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
});
