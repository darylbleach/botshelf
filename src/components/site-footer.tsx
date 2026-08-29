import Link from "next/link";

const legal = [
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/cookies", label: "Cookie policy" },
  { href: "/acceptable-use", label: "Acceptable use" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight">
            BotShelf
          </p>
          <p className="mt-1 text-xs text-[var(--fg-dim)]">
            © {new Date().getFullYear()} BotShelf. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
          {legal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--fg-muted)] transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="mailto:hello@botshelf.net"
            className="text-sm text-[var(--fg-muted)] transition hover:text-white"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
