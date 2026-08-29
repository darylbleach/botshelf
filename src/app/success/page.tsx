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
        On your shelf
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
        {params.free
          ? "Added to workspace"
          : params.demo
            ? "Demo purchase complete"
            : "Purchase complete"}
      </h1>
      <p className="mt-4 text-[var(--fg-muted)]">
        {template ? (
          <>
            <span className="text-white">{template.title}</span> is ready. Creator{" "}
            {template.author} earned credits on this sale
            {params.demo ? " (demo mode)" : ""}.
          </>
        ) : (
          "Your template is ready in the workspace."
        )}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {template && (
          <Link
            href={`/templates/${template.slug}`}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--accent)]"
          >
            Open template
          </Link>
        )}
        <Link
          href="/sell"
          className="rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          View seller desk
        </Link>
        <Link
          href="/#gallery"
          className="rounded-full px-5 py-3 text-sm text-[var(--fg-muted)] transition hover:text-white"
        >
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
