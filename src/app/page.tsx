import Image from "next/image";
import Link from "next/link";
import { MarketplaceGallery } from "@/components/marketplace-gallery";
import { listTemplates } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const templates = (await listTemplates()).filter((t) => t.status === "published");

  return (
    <>
      <section className="relative isolate min-h-[min(92vh,920px)] overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/hero-shelf.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-shelf-drift object-cover object-[68%_center] sm:object-[72%_center]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_18%_45%,rgba(7,7,8,0.92)_0%,rgba(7,7,8,0.72)_38%,rgba(7,7,8,0.35)_62%,rgba(7,7,8,0.55)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[rgba(7,7,8,0.45)]" />
          <div className="hero-accent-sweep absolute inset-y-0 left-0 w-[55%] opacity-80" />
        </div>

        <div className="relative mx-auto flex min-h-[min(92vh,920px)] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 sm:py-28">
          <p className="animate-rise mb-5 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            BotShelf
          </p>
          <h1 className="animate-rise max-w-[14ch] font-[family-name:var(--font-display)] text-[clamp(2.55rem,7.2vw,4.85rem)] font-extrabold leading-[0.96] tracking-tight text-white [animation-delay:80ms]">
            Meet your first
            <span className="mt-1 block text-[var(--accent)]">bot template</span>
          </h1>
          <p className="animate-rise mt-6 max-w-md text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg [animation-delay:140ms]">
            Browse real Grok Bots from creators — or publish yours and set a price.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:200ms]">
            <a
              href="#gallery"
              className="btn-accent inline-flex min-h-11 items-center rounded-full px-5 py-3 text-sm font-semibold transition"
            >
              Browse templates
            </a>
            <Link
              href="/submit"
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-black/25 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-black/40"
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
