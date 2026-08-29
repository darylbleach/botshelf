import Link from "next/link";
import { ConnectBankButton } from "@/components/connect-bank-button";
import { auth, authorIdForUser } from "@/lib/auth";
import { refreshSellerConnectStatus } from "@/lib/connect";
import { getSellerAnalytics, getSellerByUserId } from "@/lib/store";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  const authorId = userId ? authorIdForUser(userId) : null;

  if (authorId && (params.connect === "return" || params.connect === "refresh")) {
    await refreshSellerConnectStatus(authorId);
  }

  const analytics = authorId ? await getSellerAnalytics(authorId) : null;
  const seller = userId ? await getSellerByUserId(userId) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Creator desk
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
            Sell on BotShelf
          </h1>
          <p className="mt-3 max-w-xl text-[var(--fg-muted)]">
            List a template, set a price, get paid in cash. On every paid sale you keep{" "}
            <span className="text-white">85%</span>; BotShelf keeps{" "}
            <span className="text-white">15%</span>.{" "}
            <Link href="/fees" className="text-white underline-offset-4 hover:underline">
              See seller fees
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="btn-accent inline-flex min-h-11 items-center rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Open studio
          </Link>
          <Link
            href="/submit"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            List a template
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-[var(--line-strong)] bg-[rgba(17,17,20,0.92)] p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--fg-dim)]">Your share</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold">85%</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">To your Stripe / bank</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--fg-dim)]">Platform fee</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold">15%</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">Kept by BotShelf</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--fg-dim)]">Example</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold">£10 → £8.50</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">You earn £8.50 on a £10 listing</p>
        </div>
      </div>

      {(params.connect === "return" || params.connect === "refresh") && (
        <p className="mt-6 rounded-xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--fg-muted)]">
          {params.connect === "return"
            ? "Welcome back — we refreshed your Stripe Connect status."
            : "Onboarding link expired or refreshed — you can start Connect again below."}
        </p>
      )}

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ConnectBankButton />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Stat
            label="Your cash earned"
            value={formatPrice(analytics?.totals.cashCents ?? 0)}
          />
          <Stat label="Your sales" value={String(analytics?.totals.sales ?? 0)} />
          <Stat
            label="Payouts"
            value={seller?.payoutsEnabled ? "Connected" : "Not connected"}
          />
          <Stat label="Templates" value={String(analytics?.totals.templates ?? 0)} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.8)] p-5">
      <p className="text-sm text-[var(--fg-dim)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}
