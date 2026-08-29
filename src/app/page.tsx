import Image from "next/image";
import Link from "next/link";
import { MarketplaceGallery } from "@/components/marketplace-gallery";
import { listTemplates } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const templates = (await listTemplates()).filter((t) => t.status === "published");

  return (
    <>
      <section className="hero-stage relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/hero-shelf.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-shelf-media object-cover"
          />
          <div className="hero-veil absolute inset-0" />
        </div>

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-10 pt-24 sm:px-6 sm:pb-14 md:justify-center md:py-28 lg:px-8">
          <p className="animate-rise mb-4 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)] md:mb-5">
            BotShelf
          </p>
          <h1 className="animate-rise max-w-[11ch] font-[family-name:var(--font-display)] text-[clamp(2.35rem,11vw,4.85rem)] font-extrabold leading-[0.95] tracking-tight text-white [animation-delay:80ms] md:max-w-[14ch]">
            Meet your first
            <span className="mt-1 block text-[var(--accent)]">bot template</span>
          </h1>
          <p className="animate-rise mt-5 max-w-[34ch] text-[15px] leading-relaxed text-[var(--fg-muted)] [animation-delay:140ms] sm:mt-6 sm:max-w-md sm:text-base md:text-lg">
            Browse real Grok Bots from creators — or publish yours and set a price.
          </p>
          <div className="animate-rise mt-7 flex w-full flex-col gap-3 [animation-delay:200ms] sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap">
            <a
              href="#gallery"
              className="btn-accent inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition sm:min-h-11 sm:justify-start"
            >
              Browse templates
            </a>
            <Link
              href="/submit"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-black/40 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/45 hover:bg-black/55 sm:min-h-11 sm:justify-start"
            >
              Submit a template
            </Link>
          </div>
        </div>
      </section>

      <MarketplaceGallery initial={templates} />
    </>
  );
}
