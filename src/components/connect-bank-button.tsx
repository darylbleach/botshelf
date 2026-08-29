"use client";

import { useState } from "react";

export function ConnectBankButton({
  defaultAuthor = "Maya",
  defaultAuthorId = "author_maya",
  defaultEmail = "maya@botshelf.net",
}: {
  defaultAuthor?: string;
  defaultAuthorId?: string;
  defaultEmail?: string;
}) {
  const [author, setAuthor] = useState(defaultAuthor);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    const authorId = `author_${author.toLowerCase().replace(/\s+/g, "_")}` || defaultAuthorId;
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, author, email }),
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
        Connect Stripe once. On every sale, <strong className="text-white">85% cash</strong> goes
        straight to your Stripe balance / bank. BotShelf keeps 15%.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs text-[var(--fg-dim)]">Seller name</span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-full border border-[var(--line-strong)] bg-black/30 px-4 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-[var(--fg-dim)]">Payout email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-[var(--line-strong)] bg-black/30 px-4 py-2.5 text-sm outline-none"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="button"
        disabled={loading || !author || !email}
        onClick={start}
        className="mt-4 w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Opening Stripe…" : "Connect bank account"}
      </button>
    </div>
  );
}
