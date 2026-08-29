import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cookie policy — BotShelf",
  description: "How BotShelf uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Legal" title="Cookie policy" updated="29 August 2026">
      <LegalSection title="1. What are cookies?">
        <p>
          Cookies are small text files stored on your device. Similar technologies include local
          storage and session tokens. This policy explains how BotShelf uses them on{" "}
          <a href="https://botshelf.net" className="text-white underline-offset-4 hover:underline">
            botshelf.net
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. How we use cookies">
        <p>We use cookies and similar technologies to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-white">Keep you signed in</span> — authentication/session cookies
            so Studio, Submit and Sell recognise your account;
          </li>
          <li>
            <span className="text-white">Secure the Service</span> — CSRF and similar protections
            tied to sign-in flows;
          </li>
          <li>
            <span className="text-white">Remember preferences</span> — where we store light UI state
            on your device;
          </li>
          <li>
            <span className="text-white">Understand performance</span> — optional analytics if
            enabled on our hosting platform (for example Vercel Analytics / Speed Insights), which
            may set first-party cookies or collect technical metrics.
          </li>
        </ul>
        <p>
          We do not use third-party advertising cookies. Payment flows on Stripe may set their own
          cookies when you are redirected to checkout — see Stripe’s notices.
        </p>
      </LegalSection>

      <LegalSection title="3. Categories">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-white">Strictly necessary</span> — required for sign-in, security
            and core marketplace functions. These do not require consent under PECR where they are
            essential to provide a service you request.
          </li>
          <li>
            <span className="text-white">Analytics / performance</span> — help us understand traffic
            and reliability. Where these are not strictly necessary we will only use them in line
            with applicable UK cookie rules.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Managing cookies">
        <p>
          You can control cookies through your browser settings (block, delete or alert you when
          cookies are set). Blocking strictly necessary cookies may stop sign-in or checkout from
          working.
        </p>
        <p>
          For more on your rights, see our{" "}
          <Link href="/privacy" className="text-white underline-offset-4 hover:underline">
            Privacy policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <p>
          Questions about cookies:{" "}
          <a
            href="mailto:hello@botshelf.net"
            className="text-white underline-offset-4 hover:underline"
          >
            hello@botshelf.net
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
