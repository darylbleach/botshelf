import Link from "next/link";
import { ConnectBankButton } from "@/components/connect-bank-button";
import { refreshSellerConnectStatus } from "@/lib/connect";
import { creatorEarnings, listPurchases, listSellers, listTemplates } from "@/lib/store";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string }>;
}) {
  const params = await searchParams;
  const sellers = await listSellers();
  if (params.connect === "return" || params.connect === "refresh") {
    await Promise.all(sellers.map((s) => refreshSellerConnectStatus(s.authorId)));
  }

  const [earnings, purchases, templates, sellersNow] = await Promise.all([
    creatorEarnings(),
    listPurchases(),
    listTemplates(),
    listSellers(),
  ]);

  const totalCash = earnings.reduce((sum, e) => sum + e.cashEarnedCents, 0);
  const totalSales = purchases.length;
  const connected = sellersNow.filter((s) => s.payoutsEnabled).length;
  const platformTake = purchases.reduce((sum, p) => sum + (p.platformFeeCents ?? 0), 0);

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
            List a template, set a price, get paid in cash. Buyers check out on BotShelf;
            Stripe Connect sends <span className="text-white">85%</span> to your bank and
            keeps <span className="text-white">15%</span> for the platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="inline-flex min-h-11 items-center btn-accent rounded-full px-5 py-3 text-sm font-semibold transition"
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
          <Stat label="Seller cash paid out" value={formatPrice(totalCash)} />
          <Stat label="Platform fees (15%)" value={formatPrice(platformTake)} />
          <Stat label="Sales" value={String(totalSales)} />
          <Stat label="Banks connected" value={String(connected)} />
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Seller earnings
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[var(--fg-dim)]">
              <tr>
                <th className="px-4 py-3 font-medium">Creator</th>
                <th className="px-4 py-3 font-medium">Payouts</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Cash earned</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((row) => (
                <tr key={row.authorId} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3 font-medium">{row.author}</td>
                  <td className="px-4 py-3 text-[var(--fg-muted)]">
                    {row.payoutsEnabled ? (
                      <span className="text-[var(--ok)]">Live</span>
                    ) : row.stripeAccountId ? (
                      <span className="text-[var(--sale)]">Pending</span>
                    ) : (
                      "Not connected"
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--fg-muted)]">{row.salesCount}</td>
                  <td className="px-4 py-3 text-[var(--accent)]">
                    {formatPrice(row.cashEarnedCents)}
                  </td>
                </tr>
              ))}
              {earnings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--fg-muted)]">
                    No sales yet — connect Stripe and publish a paid template.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Recent sales
        </h2>
        <ul className="mt-4 space-y-2">
          {purchases.slice(0, 12).map((p) => {
            const tpl = templates.find((t) => t.id === p.templateId);
            const sellerCash = p.sellerPayoutCents ?? p.creatorCredits ?? 0;
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[rgba(17,17,20,0.75)] px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium">{tpl?.title ?? p.templateId}</span>
                  <span className="text-[var(--fg-dim)]"> · {p.buyerEmail}</span>
                </span>
                <span className="text-[var(--fg-muted)]">
                  {formatPrice(p.amountCents)} → seller {formatPrice(sellerCash)} / platform{" "}
                  {formatPrice(p.platformFeeCents ?? 0)}
                </span>
              </li>
            );
          })}
          {purchases.length === 0 && (
            <li className="rounded-xl border border-dashed border-[var(--line)] px-4 py-8 text-center text-[var(--fg-muted)]">
              Sales show here after checkout. Cash hits the seller’s Stripe balance automatically.
            </li>
          )}
        </ul>
      </section>
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
