import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy — BotShelf",
  description: "How BotShelf collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated="29 August 2026">
      <LegalSection title="1. Introduction">
        <p>
          This Privacy policy explains how BotShelf (“we”, “us”, “our”) collects, uses and shares
          personal data when you use{" "}
          <a href="https://botshelf.net" className="text-white underline-offset-4 hover:underline">
            botshelf.net
          </a>
          . We process personal data in line with UK GDPR and the Data Protection Act 2018.
        </p>
        <p>
          Controller: BotShelf, United Kingdom. Contact:{" "}
          <a
            href="mailto:hello@botshelf.net"
            className="text-white underline-offset-4 hover:underline"
          >
            hello@botshelf.net
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Data we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-white">Account data</span> — email address, display name (if
            provided), and account identifiers created when you sign in with a magic link.
          </li>
          <li>
            <span className="text-white">Listing data</span> — templates, descriptions, prices,
            install URLs and analytics you publish or generate in Studio.
          </li>
          <li>
            <span className="text-white">Transaction data</span> — purchase records, buyer email for
            receipts, amounts, and Stripe payment / Connect identifiers (we do not store full card
            numbers).
          </li>
          <li>
            <span className="text-white">Technical data</span> — IP address, device/browser type,
            approximate location derived from IP, and cookies or similar technologies as described
            in our{" "}
            <Link href="/cookies" className="text-white underline-offset-4 hover:underline">
              Cookie policy
            </Link>
            .
          </li>
          <li>
            <span className="text-white">Communications</span> — messages you send us (for example
            support emails).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use data">
        <p>We use personal data to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>provide, secure and improve the Service;</li>
          <li>authenticate you and maintain your session;</li>
          <li>publish and manage marketplace listings;</li>
          <li>process payments and seller payouts via Stripe;</li>
          <li>send transactional email (sign-in links, receipts, important notices);</li>
          <li>detect abuse, prevent fraud and enforce our Terms;</li>
          <li>comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Legal bases">
        <p>Depending on the activity, we rely on:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-white">Contract</span> — to provide the marketplace features you
            request;
          </li>
          <li>
            <span className="text-white">Legitimate interests</span> — to secure the platform,
            understand usage and improve the product, balanced against your rights;
          </li>
          <li>
            <span className="text-white">Legal obligation</span> — where tax, accounting or other
            law requires retention;
          </li>
          <li>
            <span className="text-white">Consent</span> — where required for non-essential cookies or
            optional marketing (we do not currently send marketing emails by default).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Sharing">
        <p>We share data with processors and partners only as needed to run BotShelf, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Vercel — hosting and application delivery;</li>
          <li>Neon — database hosting;</li>
          <li>Resend — transactional email;</li>
          <li>Stripe — payments and Connect payouts;</li>
          <li>x.ai — when you follow install links to Grok Bots (their privacy notice applies).</li>
        </ul>
        <p>
          We may also disclose data if required by law, to protect rights and safety, or in
          connection with a business transfer (for example a merger), with appropriate safeguards.
        </p>
        <p>We do not sell your personal data.</p>
      </LegalSection>

      <LegalSection title="6. International transfers">
        <p>
          Some providers process data outside the UK (for example in the EEA or United States). Where
          required, we rely on appropriate safeguards such as the UK International Data Transfer
          Agreement / Addendum or the provider’s approved transfer mechanism.
        </p>
      </LegalSection>

      <LegalSection title="7. Retention">
        <p>
          We keep account and listing data while your account is active and for a reasonable period
          afterwards for security, dispute resolution and legal compliance. Transaction records may
          be retained longer where accounting or tax rules require it. You may request deletion of
          your account; some residual logs may remain in backups for a limited time.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>Under UK data protection law you may have the right to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>access your personal data;</li>
          <li>rectify inaccurate data;</li>
          <li>erase data in certain circumstances;</li>
          <li>restrict or object to certain processing;</li>
          <li>data portability;</li>
          <li>withdraw consent where processing is consent-based.</li>
        </ul>
        <p>
          To exercise these rights, email{" "}
          <a
            href="mailto:hello@botshelf.net"
            className="text-white underline-offset-4 hover:underline"
          >
            hello@botshelf.net
          </a>
          . You may also complain to the Information Commissioner’s Office (ICO) at{" "}
          <a
            href="https://ico.org.uk"
            className="text-white underline-offset-4 hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            ico.org.uk
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We use industry-standard measures appropriate to the risk (encryption in transit, access
          controls, hosted infrastructure). No method of transmission or storage is perfectly
          secure.
        </p>
      </LegalSection>

      <LegalSection title="10. Children">
        <p>
          BotShelf is not directed at children under 18. We do not knowingly collect personal data
          from children.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may update this policy from time to time. The “Last updated” date will change when we
          do. Significant changes may also be notified in-product or by email where appropriate.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
