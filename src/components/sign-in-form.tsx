"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

export function SignInForm({ callbackUrl = "/studio" }: { callbackUrl?: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await signIn("resend", {
        email: email.trim(),
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        setError("Could not send sign-in link. Try again.");
        setPending(false);
        return;
      }
      window.location.href = `/sign-in/check-email?email=${encodeURIComponent(email.trim())}`;
    } catch {
      setError("Something went wrong. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block space-y-2">
        <span className="text-sm text-[var(--fg-muted)]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-full border border-[var(--line-strong)] bg-[rgba(17,17,20,0.9)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/40"
        />
      </label>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-accent w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
      >
        {pending ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
