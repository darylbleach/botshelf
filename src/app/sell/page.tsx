import Link from "next/link";
import { creatorEarnings, listPurchases, listTemplates } from "@/lib/store";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SellPage() {
  const [earnings, purchases, templates] = await Promise.all([
    creatorEarnings(),
    listPurchases(),
    listTemplates(),
  ]);

  const totalCredits = earnings.reduce((sum, e) => sum + e.creditsEarned, 0);
  const totalSales = purchases.length;
  const paidListings = templates.filter(
    (t) => t.status === "published" && (t.salePriceCents ?? t.priceCents) > 0,
  ).length;

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
            List a template, set a price, get paid in credits (85% of every sale).
            Cash payouts come next — credits track what you&apos;ve earned today.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-110"
        >
          List a template
        </Link>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Stat label="Credits earned" value={totalCredits.toLocaleString()} />
        <Stat label="Sales" value={String(totalSales)} />
        <Stat label="Paid listings" value={String(paidListings)} />
      </div>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Creator leaderboard
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[var(--fg-dim)]">
              <tr>
                <th className="px-4 py-3 font-medium">Creator</th>
                <th className="px-4 py-3 font-medium">Templates</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Credits</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((row) => (
                <tr key={row.authorId} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3 font-medium">{row.author}</td>
                  <td className="px-4 py-3 text-[var(--fg-muted)]">
                    {row.templatesPublished}
                  </td>
                  <td className="px-4 py-3 text-[var(--fg-muted)]">{row.salesCount}</td>
                  <td className="px-4 py-3 text-[var(--accent)]">
                    {row.creditsEarned.toLocaleString()}
                  </td>
                </tr>
              ))}
              {earnings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--fg-muted)]">
                    No sales yet — publish a paid template to start earning.
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
                  {formatPrice(p.amountCents)} → {p.creatorCredits} credits
                </span>
              </li>
            );
          })}
          {purchases.length === 0 && (
            <li className="rounded-xl border border-dashed border-[var(--line)] px-4 py-8 text-center text-[var(--fg-muted)]">
              Sales will show up here after checkout.
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
