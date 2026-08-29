import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Acceptable use policy — BotShelf",
  description: "What is and is not allowed when using BotShelf.",
};

export default function AcceptableUsePage() {
  return (
    <LegalPage eyebrow="Legal" title="Acceptable use policy" updated="29 August 2026">
      <LegalSection title="1. Purpose">
        <p>
          This Acceptable use policy sits alongside our{" "}
          <Link href="/terms" className="text-white underline-offset-4 hover:underline">
            Terms of service
          </Link>
          . It explains the behaviour we expect on BotShelf and what we will not tolerate.
        </p>
      </LegalSection>

      <LegalSection title="2. Be a good neighbour">
        <p>
          Use BotShelf in a way that is fair to other creators, buyers and the platforms you
          integrate with. Do not attempt to disrupt, overload or undermine the Service.
        </p>
      </LegalSection>

      <LegalSection title="3. Prohibited content and bots">
        <p>You must not list, sell, distribute or promote templates that:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>are illegal under UK or applicable law;</li>
          <li>are designed primarily for spam, phishing, fraud, harassment or social engineering;</li>
          <li>impersonate people, brands or organisations without a clear, lawful basis;</li>
          <li>collect personal data deceptively or without a lawful basis;</li>
          <li>distribute malware, credential stealers or similar;</li>
          <li>
            involve sexual content relating to minors (anyone under 18), or exploit vulnerable
            people;
          </li>
          <li>incite violence, terrorism or hatred against protected characteristics;</li>
          <li>
            are primarily for circumventing platform security, rate limits or access controls
            without authorisation.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Prohibited account behaviour">
        <ul className="list-disc space-y-2 pl-5">
          <li>Creating accounts to evade bans or abuse detection.</li>
          <li>Scraping the Service in a way that harms performance or bypasses access controls.</li>
          <li>Attempting to access other users’ accounts or data.</li>
          <li>Misrepresenting ownership of templates or payment details.</li>
          <li>Manipulating rankings, reviews or purchase signals.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. xAI / Grok and third-party rules">
        <p>
          Templates must also respect xAI’s terms and any other platform rules that apply to your
          bot. If xAI or another provider disables a bot because it breaches their rules, that may
          also breach this policy.
        </p>
      </LegalSection>

      <LegalSection title="6. Enforcement">
        <p>
          We may remove content, suspend payouts, disable accounts or refuse service where we
          reasonably believe this policy has been breached. Serious or repeated breaches may be
          reported to relevant authorities or payment partners where required.
        </p>
      </LegalSection>

      <LegalSection title="7. Reporting">
        <p>
          Report suspected abuse to{" "}
          <a
            href="mailto:hello@botshelf.net"
            className="text-white underline-offset-4 hover:underline"
          >
            hello@botshelf.net
          </a>
          . Include links, screenshots and as much context as you can.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
