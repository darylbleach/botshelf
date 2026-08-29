"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function ConnectBankButton() {
  const { data: session } = useSession();
  const [author, setAuthor] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim() || undefined,
          email: session?.user?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start Connect");
      window.location.href = data.onboardingUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line-strong)] bg-[rgba(17,17,20,0.9)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
        Get paid in cash
      </h2>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">
        Connect Stripe once. On every paid sale you keep{" "}
        <strong className="text-white">85%</strong> (e.g. £8.50 of a £10 listing); BotShelf keeps{" "}
        <strong className="text-white">15%</strong>.{" "}
        <a href="/fees" className="text-white underline-offset-4 hover:underline">
          Seller fees
        </a>
        .
      </p>
      <p className="mt-3 text-xs text-[var(--fg-dim)]">
        Signed in as {session?.user?.email}
      </p>
      <label className="mt-4 block space-y-1.5">
        <span className="text-xs text-[var(--fg-dim)]">Public seller name</span>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your display name"
          className="w-full rounded-full border border-[var(--line-strong)] bg-black/30 px-4 py-2.5 text-sm outline-none"
        />
      </label>
      {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="button"
        disabled={loading}
        onClick={start}
        className="btn-accent mt-4 w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
      >
        {loading ? "Opening Stripe…" : "Connect bank account"}
      </button>
    </div>
  );
}
