"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { TemplateCard } from "@/components/template-card";
import { CATEGORIES, FILTERS, type Filter, type Template } from "@/lib/types";
import { Search } from "lucide-react";

export function MarketplaceGallery({ initial }: { initial: Template[] }) {
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [filter, setFilter] = useState<Filter>("All");
  const [category, setCategory] = useState<string>("All");
  const [templates, setTemplates] = useState(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredQ) params.set("q", deferredQ);
    if (filter !== "All") params.set("filter", filter);
    if (category !== "All") params.set("category", category);

    startTransition(async () => {
      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      setTemplates(data.templates ?? []);
    });
  }, [deferredQ, filter, category]);

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-dim)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search bots, authors, instructions..."
            className="w-full rounded-full border border-[var(--line-strong)] bg-[rgba(17,17,20,0.9)] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[var(--fg-dim)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--glow)]"
          />
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
              filter === item
                ? "bg-white text-black"
                : "border border-[var(--line)] bg-transparent text-[var(--fg-muted)] hover:border-[var(--line-strong)] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
              category === item
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "border border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--line-strong)] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger ${
          pending ? "opacity-70" : "opacity-100"
        } transition-opacity`}
      >
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {templates.length === 0 && (
        <p className="py-16 text-center text-[var(--fg-muted)]">
          No templates match that search. Try another filter or submit your own.
        </p>
      )}
    </section>
  );
}
