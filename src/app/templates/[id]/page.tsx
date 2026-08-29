import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/buy-button";
import { IntegrationIcons } from "@/components/integration-icons";
import { TrackView } from "@/components/track-view";
import { getTemplate } from "@/lib/store";
import { effectivePrice, formatPrice, isOnSale } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TemplateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { id } = await params;
  const { canceled } = await searchParams;
  const template = await getTemplate(id);
  if (!template || template.status !== "published") notFound();

  const price = effectivePrice(template);
  const sale = isOnSale(template);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <TrackView templateId={template.id} />
      <Link
        href="/#gallery"
        className="text-sm text-[var(--fg-muted)] transition hover:text-white"
      >
        ← Back to gallery
      </Link>

      {canceled && (
        <p className="mt-4 rounded-xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--fg-muted)]">
          Checkout canceled — no charge. You can try again anytime.
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="animate-rise">
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-[var(--fg-dim)]">
            {template.category}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            {template.title}
          </h1>
          <p className="mt-3 text-[var(--fg-muted)]">
            by {template.author} · {template.copies} copies · {template.views ?? 0}{" "}
            views
          </p>
          <div className="mt-5">
            <IntegrationIcons items={template.integrations} />
          </div>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--fg-muted)]">
            {template.longDescription}
          </p>
          <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[rgba(17,17,20,0.8)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              How it works
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              {template.instructions}
            </p>
          </div>
        </div>

        <aside className="animate-rise h-fit rounded-2xl border border-[var(--line-strong)] bg-[rgba(17,17,20,0.92)] p-6 [animation-delay:100ms]">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-display)] text-3xl font-bold">
              {formatPrice(price)}
            </span>
            {sale && (
              <span className="text-sm text-[var(--fg-dim)] line-through">
                {formatPrice(template.priceCents)}
              </span>
            )}
          </div>
          <p className="mb-6 text-sm text-[var(--fg-muted)]">
            {price === 0
              ? "Free. Opens the Grok Bot add page on x.ai."
              : "One-time purchase. After checkout you get Add to Grok Bot — seller keeps 85% cash."}
          </p>
          <BuyButton template={template} />
          <a
            href={template.templateUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block text-center text-sm text-[var(--fg-dim)] underline-offset-4 hover:text-white hover:underline"
          >
            Preview on x.ai/bot
          </a>
        </aside>
      </div>
    </div>
  );
}
