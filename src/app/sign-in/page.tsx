import { SignInForm } from "@/components/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Account
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.85rem,6vw,2.5rem)] font-bold tracking-tight">
        Sign in to BotShelf
      </h1>
      <p className="mt-3 text-[var(--fg-muted)]">
        Manage your bots, pricing, and payouts. We email you a one-click sign-in
        link — no password.
      </p>
      {params.error && (
        <p className="mt-4 rounded-xl border border-[var(--danger)]/40 bg-[rgba(255,107,122,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          Sign-in link expired or invalid. Request a new one below.
        </p>
      )}
      <SignInForm callbackUrl={params.callbackUrl || "/studio"} />
    </div>
  );
}
