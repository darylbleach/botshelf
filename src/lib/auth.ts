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

const resendApiKey = process.env.AUTH_RESEND_KEY ?? process.env.RESEND_API_KEY;
const emailFrom =
  process.env.AUTH_EMAIL_FROM ?? "BotShelf <sign-in@send.botshelf.net>";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: resendApiKey,
      from: emailFrom,
      async sendVerificationRequest({ identifier: to, url, provider }) {
        const { host } = new URL(url);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to,
            subject: `Your BotShelf sign-in link`,
            text: [
              `Sign in to BotShelf (${host})`,
              "",
              `Open this link to finish signing in:`,
              url,
              "",
              `If you did not request this, you can ignore this email.`,
            ].join("\n"),
            html: `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#0b0b0d;color:#e8e8ea;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background:#141418;border:1px solid #2a2a30;border-radius:16px;">
      <tr>
        <td style="padding:28px 28px 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#f5c518;font-weight:700;">
          BotShelf
        </td>
      </tr>
      <tr>
        <td style="padding:8px 28px 0;font-size:24px;font-weight:700;color:#ffffff;">
          Sign in to your account
        </td>
      </tr>
      <tr>
        <td style="padding:12px 28px 24px;font-size:15px;line-height:1.5;color:#b8b8c0;">
          Use the button below to finish signing in to ${host}. This link expires shortly and can only be used once.
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 28px;">
          <a href="${url}" style="display:inline-block;background:#f5c518;color:#000000;text-decoration:none;font-weight:700;font-size:15px;padding:12px 20px;border-radius:999px;">
            Sign in to BotShelf
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 28px;font-size:12px;line-height:1.5;color:#7a7a84;">
          If the button does not work, paste this URL into your browser:<br />
          <span style="word-break:break-all;color:#b8b8c0;">${url}</span>
        </td>
      </tr>
    </table>
    <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#6a6a72;text-align:center;">
      You received this because someone tried to sign in to BotShelf with this email. If that was not you, ignore it.
    </p>
  </body>
</html>`,
          }),
        });
        if (!res.ok) {
          throw new Error(`Resend error: ${JSON.stringify(await res.json())}`);
        }
      },
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
