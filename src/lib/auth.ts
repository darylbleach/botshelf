import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY ?? process.env.RESEND_API_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? "BotShelf <onboarding@resend.dev>",
    }),
  ],
  // JWT keeps middleware/edge session checks simple with Resend magic links.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/check-email",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  trustHost: true,
});

export function authorIdForUser(userId: string) {
  return `user_${userId.replace(/-/g, "").slice(0, 16)}`;
}

export function displayNameFromUser(user: {
  name?: string | null;
  email?: string | null;
}) {
  if (user.name?.trim()) return user.name.trim();
  const email = user.email ?? "creator";
  return email.split("@")[0] || "creator";
}
