"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/types";

const INTEGRATIONS = ["gmail", "x", "browser", "slack", "notion", "calendar"] as const;

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<string[]>(["browser"]);
  const [listForSale, setListForSale] = useState(true);
  const [price, setPrice] = useState("19");

  function toggleIntegration(value: string) {
    setIntegrations((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const priceCents = listForSale ? Math.round(Number(price) * 100) : 0;

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          longDescription: form.get("longDescription") || undefined,
          category: form.get("category"),
          author: form.get("author"),
          priceCents,
          templateUrl: form.get("templateUrl"),
          instructions: form.get("instructions"),
          integrations,
          listForSale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not publish template");
      router.push(`/templates/${data.template.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Publish
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
        Submit a template
      </h1>
      <p className="mt-3 text-[var(--fg-muted)]">
        List free or paid. Paid listings pay you 85% in credits on every sale.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <Field label="Title" name="title" required placeholder="Harvey Specter" />
        <Field
          label="Short description"
          name="description"
          required
          placeholder="What does this bot do in one or two lines?"
        />
        <label className="block space-y-2">
          <span className="text-sm text-[var(--fg-muted)]">Longer pitch</span>
          <textarea
            name="longDescription"
            rows={4}
            className="w-full rounded-2xl border border-[var(--line-strong)] bg-[rgba(17,17,20,0.9)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/40"
            placeholder="Optional — show up on the detail page"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-[var(--fg-muted)]">Category</span>
            <select
              name="category"
              defaultValue="Productivity"
              className="w-full rounded-full border border-[var(--line-strong)] bg-[rgba(17,17,20,0.9)] px-4 py-3 text-sm outline-none"
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Field label="Your name" name="author" required placeholder="Liam" />
        </div>
        <Field
          label="Template URL"
          name="templateUrl"
          required
          type="url"
          placeholder="https://..."
        />
        <Field
          label="Instructions"
          name="instructions"
          required
          placeholder="How should buyers run it?"
        />

        <div className="space-y-2">
          <span className="text-sm text-[var(--fg-muted)]">Integrations</span>
          <div className="flex flex-wrap gap-2">
            {INTEGRATIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleIntegration(item)}
                className={`rounded-full px-3 py-1.5 text-sm capitalize transition ${
                  integrations.includes(item)
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "border border-[var(--line)] text-[var(--fg-muted)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.75)] p-4">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-medium">List for sale</span>
              <span className="text-sm text-[var(--fg-muted)]">
                Turn off to publish as free
              </span>
            </span>
            <input
              type="checkbox"
              checked={listForSale}
              onChange={(e) => setListForSale(e.target.checked)}
              className="h-5 w-5 accent-[var(--accent)]"
            />
          </label>
          {listForSale && (
            <label className="mt-4 block space-y-2">
              <span className="text-sm text-[var(--fg-muted)]">Price (USD)</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="1"
                step="1"
                className="w-full rounded-full border border-[var(--line-strong)] bg-black/30 px-4 py-3 text-sm outline-none"
              />
            </label>
          )}
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading || integrations.length === 0}
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {loading ? "Publishing…" : "Publish to BotShelf"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-[var(--fg-muted)]">{label}</span>
      <input
        name={name}
        required={required}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-full border border-[var(--line-strong)] bg-[rgba(17,17,20,0.9)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/40"
      />
    </label>
  );
}
