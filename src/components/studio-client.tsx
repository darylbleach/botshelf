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

type Author = { authorId: string; author: string };

export function StudioClient({
  initialAuthorId,
}: {
  initialAuthorId?: string;
}) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorId, setAuthorId] = useState(initialAuthorId ?? "");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setAuthors(d.authors ?? []);
        setAuthorId((current) => current || d.authors?.[0]?.authorId || "");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authorId) return;
    startTransition(async () => {
      const res = await fetch(`/api/analytics?authorId=${encodeURIComponent(authorId)}`);
      const data = await res.json();
      setAnalytics(data.analytics ?? null);
    });
  }, [authorId]);

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
        authorId,
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
    const refreshed = await fetch(
      `/api/analytics?authorId=${encodeURIComponent(authorId)}`,
    ).then((r) => r.json());
    setAnalytics(refreshed.analytics ?? null);
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
          </p>
        </div>
        <label className="block min-w-[220px] space-y-1.5">
          <span className="text-xs text-[var(--fg-dim)]">Account</span>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full rounded-full border border-[var(--line-strong)] bg-[rgba(17,17,20,0.9)] px-4 py-2.5 text-sm outline-none"
          >
            {authors.map((a) => (
              <option key={a.authorId} value={a.authorId}>
                {a.author}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message && (
        <p className="rounded-xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--fg-muted)]">
          {message}
        </p>
      )}

      {analytics && (
        <>
          <div
            className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${pending ? "opacity-70" : ""}`}
          >
            <Stat label="Views" value={analytics.totals.views.toLocaleString()} />
            <Stat label="Sales" value={String(analytics.totals.sales)} />
            <Stat
              label="Cash earned (85%)"
              value={formatPrice(analytics.totals.cashCents)}
            />
            <Stat
              label="Conversion"
              value={`${analytics.totals.conversion}%`}
            />
          </div>

          <section className="rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.8)] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                Cash last 14 days
              </h2>
              <p className="text-xs text-[var(--fg-dim)]">
                Gross {formatPrice(analytics.totals.grossCents)} · avg order{" "}
                {formatPrice(analytics.totals.avgOrderCents)}
              </p>
            </div>
            <div className="flex h-36 items-end gap-1.5">
              {analytics.series.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-[var(--accent)]/80 transition"
                    style={{
                      height: `${Math.max(4, (day.cashCents / maxCash) * 100)}%`,
                    }}
                    title={`${day.date}: ${formatPrice(day.cashCents)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-[var(--fg-dim)]">
              <span>{analytics.series[0]?.date.slice(5)}</span>
              <span>{analytics.series.at(-1)?.date.slice(5)}</span>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                Price your bots
              </h2>
              <Link
                href="/submit"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                + New template
              </Link>
            </div>
            <div className="space-y-3">
              {analytics.byTemplate.map((t) => (
                <PriceRow key={t.id} template={t} onSave={savePrice} />
              ))}
              {analytics.byTemplate.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-8 text-center text-[var(--fg-muted)]">
                  No templates yet.{" "}
                  <Link href="/submit" className="text-[var(--accent)]">
                    Submit one
                  </Link>
                  .
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
              Recent sales
            </h2>
            <ul className="space-y-2">
              {analytics.recentSales.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[rgba(17,17,20,0.75)] px-4 py-3 text-sm"
                >
                  <span>
                    <span className="font-medium">{s.templateTitle}</span>
                    <span className="text-[var(--fg-dim)]"> · {s.buyerEmail}</span>
                  </span>
                  <span className="text-[var(--fg-muted)]">
                    {formatPrice(s.amountCents)} → you {formatPrice(s.sellerPayoutCents)}
                  </span>
                </li>
              ))}
              {analytics.recentSales.length === 0 && (
                <li className="rounded-xl border border-dashed border-[var(--line)] px-4 py-8 text-center text-[var(--fg-muted)]">
                  No sales on this account yet.
                </li>
              )}
            </ul>
          </section>
        </>
      )}
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

function PriceRow({
  template,
  onSave,
}: {
  template: Analytics["byTemplate"][number];
  onSave: (id: string, price: string, sale: string) => Promise<void>;
}) {
  const [price, setPrice] = useState(String(template.priceCents / 100));
  const [sale, setSale] = useState(
    template.salePriceCents != null ? String(template.salePriceCents / 100) : "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrice(String(template.priceCents / 100));
    setSale(
      template.salePriceCents != null ? String(template.salePriceCents / 100) : "",
    );
  }, [template.priceCents, template.salePriceCents]);

  const takeHome = Math.round(Number(sale || price || 0) * 100 * 0.85) / 100;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.85)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/templates/${template.slug}`}
            className="font-[family-name:var(--font-display)] text-lg font-semibold hover:text-[var(--accent)]"
          >
            {template.title}
          </Link>
          <p className="mt-1 text-xs text-[var(--fg-dim)]">
            {template.views} views · {template.sales} sales · {template.conversion}% conv ·{" "}
            {formatPrice(template.cashCents)} cash
          </p>
        </div>
        <p className="text-xs text-[var(--fg-muted)]">
          You keep ~${takeHome.toFixed(2)} / sale
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block space-y-1">
          <span className="text-xs text-[var(--fg-dim)]">List price (USD)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-full border border-[var(--line-strong)] bg-black/30 px-4 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-[var(--fg-dim)]">Sale price (optional)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={sale}
            onChange={(e) => setSale(e.target.value)}
            placeholder="Leave blank for none"
            className="w-full rounded-full border border-[var(--line-strong)] bg-black/30 px-4 py-2.5 text-sm outline-none"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(template.id, price, sale);
            setSaving(false);
          }}
          className="btn-accent self-end rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save price"}
        </button>
      </div>
    </div>
  );
}
