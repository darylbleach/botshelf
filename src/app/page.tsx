import Link from "next/link";
import { MarketplaceGallery } from "@/components/marketplace-gallery";
import { listTemplates } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const templates = (await listTemplates()).filter((t) => t.status === "published");

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="shelf-grid pointer-events-none absolute inset-0 opacity-70"
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
          <p className="animate-rise mb-5 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            BotShelf
          </p>
          <h1 className="animate-rise max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,7vw,4.6rem)] font-extrabold leading-[0.98] tracking-tight text-white [animation-delay:80ms]">
            Meet your first
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[var(--accent)]">
              bot template
            </span>
          </h1>
          <p className="animate-rise mt-6 max-w-xl text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg [animation-delay:140ms]">
            Templates built by people who actually ship. Add one to your workspace
            in a click, or publish your own and get paid in credits.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:200ms]">
            <a
              href="#gallery"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--accent)]"
            >
              Browse templates
            </a>
            <Link
              href="/submit"
              className="rounded-full border border-[var(--line-strong)] bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              Submit a template
            </Link>
          </div>
          <div
            aria-hidden
            className="animate-fade pointer-events-none absolute -right-8 top-24 hidden h-72 w-72 rounded-[2rem] border border-[var(--line)] bg-gradient-to-br from-[rgba(216,255,74,0.14)] via-transparent to-[rgba(120,160,255,0.12)] blur-[1px] lg:block [animation-delay:300ms]"
          />
        </div>
      </section>

      <MarketplaceGallery initial={templates} />
    </>
  );
}
