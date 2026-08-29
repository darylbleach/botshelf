"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Template } from "@/lib/types";
import { effectivePrice, formatPrice, isOnSale } from "@/lib/types";

export function BuyButton({ template }: { template: Template }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const price = effectivePrice(template);
  const sale = isOnSale(template);

  async function checkout(demo = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          buyerEmail: email || undefined,
          demo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) router.push(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (price === 0) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() => checkout(false)}
        className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--accent)] disabled:opacity-60"
      >
        {loading ? "Adding…" : "Add to workspace"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email for receipt"
        className="w-full rounded-full border border-[var(--line-strong)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/50"
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => checkout(false)}
        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-110 disabled:opacity-60"
      >
        {loading
          ? "Starting checkout…"
          : sale
            ? `Buy for ${formatPrice(price)} (was ${formatPrice(template.priceCents)})`
            : `Buy for ${formatPrice(price)}`}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => checkout(true)}
        className="w-full rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-sm text-[var(--fg-muted)] transition hover:text-white disabled:opacity-60"
      >
        Demo purchase (no card)
      </button>
    </div>
  );
}
