"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#gallery", label: "Browse" },
  { href: "/submit", label: "Submit" },
  { href: "/sell", label: "Sell" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(7,7,8,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-[var(--accent)] text-[var(--accent-ink)]">
            <span
              aria-hidden
              className="absolute inset-x-1 bottom-1.5 h-[2px] rounded-full bg-[var(--accent-ink)]/80"
            />
            <span
              aria-hidden
              className="absolute inset-x-2 bottom-2.5 h-[2px] rounded-full bg-[var(--accent-ink)]/55"
            />
            <span className="relative mt-[-6px] font-[family-name:var(--font-display)] text-sm font-extrabold tracking-tight">
              B
            </span>
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
            BotShelf
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-[var(--fg-muted)] hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/submit"
            className="ml-1 hidden rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-black transition hover:bg-[var(--accent)] sm:inline-flex"
          >
            List a template
          </Link>
        </nav>
      </div>
    </header>
  );
}
