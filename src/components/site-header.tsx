"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#gallery", label: "Browse" },
  { href: "/studio", label: "Studio" },
  { href: "/submit", label: "Submit" },
  { href: "/sell", label: "Sell" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(7,7,8,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex min-h-10 items-center rounded-full px-3 py-1.5 text-sm transition ${
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
            className="btn-accent ml-1 inline-flex min-h-10 items-center rounded-full px-3.5 py-1.5 text-sm font-semibold transition"
          >
            List a template
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] text-white md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <span aria-hidden className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 block h-0.5 w-4 rounded-full bg-white transition ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-4 rounded-full bg-white transition ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-4 rounded-full bg-white transition ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div
          id={menuId}
          className="border-t border-[var(--line)] bg-[rgba(7,7,8,0.96)] px-4 py-3 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`inline-flex min-h-12 items-center rounded-xl px-4 text-base transition ${
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
              onClick={() => setOpen(false)}
              className="btn-accent mt-2 inline-flex min-h-12 items-center justify-center rounded-full px-4 text-base font-semibold"
            >
              List a template
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
