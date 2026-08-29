import Link from "next/link";
import { IntegrationIcons } from "@/components/integration-icons";
import { effectivePrice, formatPrice, isOnSale, type Template } from "@/lib/types";

export function TemplateCard({ template }: { template: Template }) {
  const price = effectivePrice(template);
  const sale = isOnSale(template);

  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group relative flex min-h-[168px] flex-col rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.88)] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-[rgba(22,22,26,0.95)]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold tracking-tight text-white transition group-hover:text-[var(--accent)]">
          {template.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            price === 0
              ? "bg-white/10 text-white"
              : sale
                ? "bg-[rgba(255,139,92,0.18)] text-[var(--sale)]"
                : "btn-accent"
          }`}
        >
          {formatPrice(price)}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--fg-dim)]">
        <span className="text-[var(--fg-muted)]">{template.category}</span>
        <span aria-hidden>·</span>
        <span>{template.author}</span>
        <span aria-hidden>·</span>
        <span>{template.copies} copies</span>
      </div>

      <div className="mb-3">
        <IntegrationIcons items={template.integrations} />
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-[var(--fg-muted)]">
        {template.description}
      </p>
    </Link>
  );
}
