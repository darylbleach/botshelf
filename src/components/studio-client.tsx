"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/types";

type Analytics = {
  authorId: string;
  author: string;
  seller?: {
    payoutsEnabled: boolean;
    stripeAccountId?: string;
  } | null;
  totals: {
    templates: number;
    views: number;
    sales: number;
    grossCents: number;
    cashCents: number;
    platformFeeCents: number;
    conversion: number;
    avgOrderCents: number;
  };
  byTemplate: Array<{
    id: string;
    slug: string;
    title: string;
    priceCents: number;
    salePriceCents?: number;
    views: number;
    copies: number;
    sales: number;
    revenueCents: number;
    cashCents: number;
    conversion: number;
  }>;
  recentSales: Array<{
    id: string;
    templateTitle: string;
    buyerEmail: string;
    amountCents: number;
    sellerPayoutCents: number;
    platformFeeCents: number;
    createdAt: string;
  }>;
  series: Array<{ date: string; sales: number; cashCents: number }>;
};

export function StudioClient() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    startTransition(async () => {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not load studio");
        return;
      }
      setAnalytics(data.analytics ?? null);
      setEmail(data.author?.email ?? null);
    });
  }

  useEffect(() => {
    load();
  }, []);

  const maxCash = useMemo(
    () => Math.max(1, ...(analytics?.series.map((d) => d.cashCents) ?? [1])),
    [analytics],
  );

  async function savePrice(
    templateId: string,
    priceDollars: string,
    saleDollars: string,
  ) {
    setMessage(null);
    const priceCents = Math.round(Number(priceDollars || "0") * 100);
    const saleRaw = saleDollars.trim();
    const salePriceCents =
      saleRaw === "" ? null : Math.round(Number(saleRaw) * 100);

    const res = await fetch(`/api/templates/${templateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceCents,
        salePriceCents,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not update price");
      return;
    }
    setMessage(`Saved pricing for ${data.template.title}`);
    load();
  }

  async function deleteBot(templateId: string, title: string) {
    const ok = window.confirm(
      `Delete “${title}”? It will be removed from the marketplace. Past sales stay in your history.`,
    );
    if (!ok) return;

    setMessage(null);
    const res = await fetch(`/api/templates/${templateId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(
        typeof data.error === "string" ? data.error : "Could not delete bot",
      );
      return;
    }
    setMessage(`Deleted “${title}”`);
    load();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Studio
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
            Your bots & analytics
          </h1>
          <p className="mt-3 max-w-xl text-[var(--fg-muted)]">
            Set your own prices, run sales, and track views, conversion, and cash.
            {email ? (
              <>
                {" "}
                Signed in as <span className="text-white">{email}</span>.
              </>
            ) : null}
          </p>
        </div>
        <Link
          href="/submit"
          className="btn-accent inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
        >
          List a template
        </Link>
      </div>

      {message && (
        <p className="rounded-xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--fg-muted)]">
          {message}
        </p>
      )}

      {pending && !analytics && (
        <p className="text-sm text-[var(--fg-muted)]">Loading your studio…</p>
      )}

      {analytics && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Views" value={String(analytics.totals.views)} />
            <Metric label="Sales" value={String(analytics.totals.sales)} />
            <Metric label="Cash" value={formatPrice(analytics.totals.cashCents)} />
            <Metric label="Conversion" value={`${analytics.totals.conversion}%`} />
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.88)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Last 14 days
            </h2>
            <div className="mt-4 flex h-28 items-end gap-1.5">
              {analytics.series.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-[var(--accent)]/80 transition"
                    style={{ height: `${Math.max(4, (d.cashCents / maxCash) * 100)}%` }}
                    title={`${d.date}: ${formatPrice(d.cashCents)}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Your templates
            </h2>
            {analytics.byTemplate.length === 0 && (
              <p className="text-sm text-[var(--fg-muted)]">
                No listings yet.{" "}
                <Link href="/submit" className="text-white underline-offset-4 hover:underline">
                  Publish your first bot
                </Link>
                .
              </p>
            )}
            {analytics.byTemplate.map((t) => (
              <PriceRow
                key={t.id}
                template={t}
                onSave={savePrice}
                onDelete={deleteBot}
              />
            ))}
          </div>

          {analytics.recentSales.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                Recent sales
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-[var(--fg-dim)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Template</th>
                      <th className="px-4 py-3 font-medium">Buyer</th>
                      <th className="px-4 py-3 font-medium">Your cash</th>
                      <th className="px-4 py-3 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentSales.map((s) => (
                      <tr key={s.id} className="border-t border-[var(--line)]">
                        <td className="px-4 py-3">{s.templateTitle}</td>
                        <td className="px-4 py-3 text-[var(--fg-muted)]">{s.buyerEmail}</td>
                        <td className="px-4 py-3">{formatPrice(s.sellerPayoutCents)}</td>
                        <td className="px-4 py-3 text-[var(--fg-dim)]">
                          {new Date(s.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.88)] p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--fg-dim)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">{value}</p>
    </div>
  );
}

function PriceRow({
  template,
  onSave,
  onDelete,
}: {
  template: Analytics["byTemplate"][number];
  onSave: (id: string, price: string, sale: string) => Promise<void>;
  onDelete: (id: string, title: string) => Promise<void>;
}) {
  const [price, setPrice] = useState(String(template.priceCents / 100));
  const [sale, setSale] = useState(
    template.salePriceCents != null ? String(template.salePriceCents / 100) : "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPrice(String(template.priceCents / 100));
    setSale(
      template.salePriceCents != null ? String(template.salePriceCents / 100) : "",
    );
  }, [template.priceCents, template.salePriceCents]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.88)] p-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link
          href={`/templates/${template.slug}`}
          className="font-[family-name:var(--font-display)] font-semibold hover:text-[var(--accent)]"
        >
          {template.title}
        </Link>
        <p className="mt-1 text-xs text-[var(--fg-dim)]">
          {template.views} views · {template.sales} sales · {template.conversion}% conv
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1">
          <span className="text-xs text-[var(--fg-dim)]">Price $</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-24 rounded-full border border-[var(--line-strong)] bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-[var(--fg-dim)]">Sale $</span>
          <input
            value={sale}
            onChange={(e) => setSale(e.target.value)}
            placeholder="—"
            className="w-24 rounded-full border border-[var(--line-strong)] bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </label>
        <button
          type="button"
          disabled={saving || deleting}
          onClick={async () => {
            setSaving(true);
            await onSave(template.id, price, sale);
            setSaving(false);
          }}
          className="btn-accent self-end rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={saving || deleting}
          onClick={async () => {
            setDeleting(true);
            await onDelete(template.id, template.title);
            setDeleting(false);
          }}
          className="self-end rounded-full border border-[var(--danger)]/40 px-4 py-2.5 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)]/10 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
