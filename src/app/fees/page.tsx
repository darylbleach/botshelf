import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Seller fees — BotShelf",
  description: "How much sellers earn on BotShelf: you keep 85% of each sale.",
};

export default function FeesPage() {
  return (
    <LegalPage eyebrow="Creators" title="Seller fees" updated="29 August 2026">
      <LegalSection title="The short answer">
        <p>
          On every paid sale, <span className="text-white">you keep 85%</span> of the listing
          price. BotShelf keeps <span className="text-white">15%</span> as the platform fee.
        </p>
        <p className="mt-4 rounded-2xl border border-[var(--line-strong)] bg-white/[0.04] px-5 py-4 text-white">
          Example: you price a bot at <span className="font-semibold">£10.00</span> → you receive{" "}
          <span className="font-semibold">£8.50</span> → BotShelf keeps{" "}
          <span className="font-semibold">£1.50</span>.
        </p>
      </LegalSection>

      <LegalSection title="What the split applies to">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The split is calculated on the <span className="text-white">listing price</span> the
            buyer pays for your template (before any separate taxes Stripe may collect).
          </li>
          <li>Free listings (£0) have no platform fee and no cash payout.</li>
          <li>
            You set the price when you{" "}
            <Link href="/submit" className="text-white underline-offset-4 hover:underline">
              submit a template
            </Link>
            ; you can change it later in Studio.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How you get paid">
        <p>
          Paid sales are processed by Stripe. When your{" "}
          <Link href="/sell" className="text-white underline-offset-4 hover:underline">
            Stripe Connect
          </Link>{" "}
          account is fully set up, about 85% of each sale is sent to your connected Stripe balance
          for payout to your bank. BotShelf’s 15% is retained as an application fee.
        </p>
        <p>
          Stripe’s own processing fees are charged by Stripe under their terms and may reduce the
          net amount that lands in your bank, depending on card type, currency and your Stripe
          account settings. BotShelf does not add a second “hidden” marketplace cut beyond the 15%
          platform fee.
        </p>
      </LegalSection>

      <LegalSection title="When payouts can be delayed">
        <p>
          If Connect onboarding is incomplete, sales can still be recorded, but cash payouts may
          wait until your account can receive transfers. Chargebacks, refunds or suspected abuse can
          also hold or reverse funds while we and Stripe investigate.
        </p>
      </LegalSection>

      <LegalSection title="Where this is binding">
        <p>
          This page explains the fee model in plain English. The binding contract is our{" "}
          <Link href="/terms" className="text-white underline-offset-4 hover:underline">
            Terms of service
          </Link>
          . Questions:{" "}
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
