import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of service — BotShelf",
  description: "The terms that govern use of the BotShelf marketplace.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of service" updated="29 August 2026">
      <LegalSection title="1. Who we are">
        <p>
          BotShelf (“we”, “us”, “our”) operates the website at{" "}
          <a href="https://botshelf.net" className="text-white underline-offset-4 hover:underline">
            botshelf.net
          </a>{" "}
          (the “Service”). These Terms of Service (the “Terms”) form a contract between you and
          BotShelf governing your access to and use of the Service.
        </p>
        <p>
          The Service is operated from the United Kingdom. Contact:{" "}
          <a
            href="mailto:hello@botshelf.net"
            className="text-white underline-offset-4 hover:underline"
          >
            hello@botshelf.net
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Acceptance">
        <p>
          By creating an account, browsing the marketplace, submitting a template, buying a
          template, or otherwise using BotShelf, you agree to these Terms and our{" "}
          <Link href="/privacy" className="text-white underline-offset-4 hover:underline">
            Privacy policy
          </Link>
          ,{" "}
          <Link href="/cookies" className="text-white underline-offset-4 hover:underline">
            Cookie policy
          </Link>{" "}
          and{" "}
          <Link href="/acceptable-use" className="text-white underline-offset-4 hover:underline">
            Acceptable use policy
          </Link>
          . If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility">
        <p>
          You must be at least 18 years old and able to form a binding contract under the laws of
          England and Wales. If you use BotShelf on behalf of an organisation, you confirm that you
          have authority to bind that organisation.
        </p>
      </LegalSection>

      <LegalSection title="4. Accounts">
        <p>
          Some features (including Studio, Submit and Sell) require an account. We use email
          magic-link sign-in. You are responsible for keeping access to your email secure and for
          activity under your account. Tell us promptly if you suspect unauthorised access.
        </p>
        <p>
          We may suspend or close accounts that breach these Terms, create risk for other users, or
          appear fraudulent.
        </p>
      </LegalSection>

      <LegalSection title="5. The marketplace">
        <p>
          BotShelf is a marketplace for Grok Bot templates and related listing information. Listings
          may be free or paid. Paid checkouts are processed by Stripe. Where Stripe Connect is
          enabled for a seller, we aim to route approximately 85% of the purchase price to the
          seller and retain approximately 15% as a platform fee, subject to Stripe fees, taxes,
          chargebacks and applicable law.
        </p>
        <p>
          Installation of bots happens on third-party platforms such as x.ai. We do not operate
          those platforms and are not responsible for their availability, pricing, policies or bot
          behaviour after you leave BotShelf.
        </p>
      </LegalSection>

      <LegalSection title="6. Sellers and listings">
        <p>If you publish a template you confirm that:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>you own or have rights to offer the listing and linked bot;</li>
          <li>
            your listing is accurate, not misleading, and does not infringe others’ intellectual
            property, privacy or other rights;
          </li>
          <li>
            your Grok Bot URL is a genuine, working <code className="text-white">x.ai/bot/…</code>{" "}
            link that you are authorised to share;
          </li>
          <li>
            you will not list malware, scams, illegal content, or bots designed to harm others;
          </li>
          <li>
            you will complete any Stripe Connect / identity steps required to receive payouts.
          </li>
        </ul>
        <p>
          We may remove, edit, unfeature or refuse listings at our discretion, including for
          quality, safety, legal or brand reasons. Until durable payouts are fully enabled by
          Stripe, payout timing may be delayed; we will not invent guaranteed settlement dates.
        </p>
      </LegalSection>

      <LegalSection title="7. Buyers and payments">
        <p>
          Prices are shown on each listing. By purchasing you authorise Stripe to charge the
          displayed amount (plus any stated taxes). Free listings may still require confirming an
          email or opening an external install link.
        </p>
        <p>
          Digital goods are generally supplied immediately. Where UK consumer law gives you a
          cooling-off right for distance contracts, you acknowledge that by requesting immediate
          digital delivery you may lose that right for the supplied content once performance has
          begun, to the extent permitted by law.
        </p>
        <p>
          Refunds are handled case by case. Chargebacks may result in suspension of buyer or seller
          accounts while we investigate.
        </p>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>
          You must follow our{" "}
          <Link href="/acceptable-use" className="text-white underline-offset-4 hover:underline">
            Acceptable use policy
          </Link>
          . In particular, you must not:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>probe, scrape or overload the Service beyond normal use;</li>
          <li>attempt to access another user’s account or data;</li>
          <li>upload unlawful, harmful, deceptive or infringing material;</li>
          <li>misrepresent affiliation with BotShelf, xAI, Stripe or others;</li>
          <li>use the Service to facilitate fraud, spam or illegal activity.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          BotShelf’s branding, site design and platform software remain ours. Sellers retain rights
          in their listings and bots, and grant BotShelf a worldwide, non-exclusive licence to host,
          display, promote and distribute listing content as needed to operate the marketplace.
          Buyers receive only the access rights described on the listing / install flow — usually a
          right to use the linked Grok Bot subject to x.ai’s terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Third-party services">
        <p>
          The Service relies on providers including Vercel (hosting), Neon (database), Resend
          (email), Stripe (payments) and x.ai (bot hosting). Their terms and privacy notices also
          apply when you use those services.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimers">
        <p>
          The Service is provided “as is” and “as available”. We do not warrant that listings are
          error-free, that bots will meet your needs, or that the Service will be uninterrupted.
          Templates are created by third parties; we do not endorse every listing.
        </p>
      </LegalSection>

      <LegalSection title="12. Liability">
        <p>
          Nothing in these Terms excludes or limits liability for death or personal injury caused by
          negligence, fraud, or any liability that cannot be limited under English law.
        </p>
        <p>
          Subject to that, we are not liable for indirect or consequential loss, lost profits, lost
          data, or business interruption. Our total aggregate liability arising out of or relating
          to the Service in any 12-month period is limited to the greater of (a) the fees you paid
          us in that period and (b) £100.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes">
        <p>
          We may update these Terms from time to time. Material changes will be indicated by
          updating the “Last updated” date. Continued use after changes constitutes acceptance of
          the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="14. Governing law">
        <p>
          These Terms are governed by the laws of England and Wales. The courts of England and Wales
          have exclusive jurisdiction, without prejudice to mandatory consumer protections that
          apply if you are a consumer resident elsewhere in the UK.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
