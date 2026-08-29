import type { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.85rem,6vw,2.75rem)] font-bold tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm text-[var(--fg-dim)]">Last updated: {updated}</p>
      <div className="legal-prose mt-10 space-y-8 text-[15px] leading-relaxed text-[var(--fg-muted)]">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}
