import Link from "next/link";
import { ConfirmPurchase } from "@/components/confirm-purchase";
import { getTemplate } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; session_id?: string; free?: string; demo?: string }>;
}) {
  const params = await searchParams;
  const template = params.template ? await getTemplate(params.template) : undefined;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
      {params.session_id && <ConfirmPurchase sessionId={params.session_id} />}
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ok)]">
        Ready for Grok
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
        {params.free
          ? "Bot unlocked"
          : params.demo
            ? "Purchase simulated"
            : "Purchase complete"}
      </h1>
      <p className="mt-4 text-[var(--fg-muted)]">
        {template ? (
          <>
            Add <span className="text-white">{template.title}</span> to Grok Bot on x.ai.
            {params.demo || params.session_id
              ? ` ${template.author} gets 85% cash on this sale${params.demo ? " (simulated)" : ""}.`
              : null}
          </>
        ) : (
          "Your bot is ready — open it on x.ai to add to Grok Bot."
        )}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {template && (
          <a
            href={template.templateUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-accent rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Add to Grok Bot
          </a>
        )}
        <Link
          href="/#gallery"
          className="rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          Browse more
        </Link>
        <Link
          href="/studio"
          className="rounded-full px-5 py-3 text-sm text-[var(--fg-muted)] transition hover:text-white"
        >
          Seller studio
        </Link>
      </div>
      {template && (
        <p className="mt-6 break-all text-xs text-[var(--fg-dim)]">{template.templateUrl}</p>
      )}
    </div>
  );
}
