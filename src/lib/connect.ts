import { PLATFORM_FEE_BPS, appUrl, getStripe } from "@/lib/stripe";
import { upsertSeller, getSeller, listSellers } from "@/lib/store";
import type { Seller } from "@/lib/types";

export async function createSellerConnectAccount(input: {
  authorId: string;
  author: string;
  email: string;
  userId: string;
  country?: string;
}): Promise<{ seller: Seller; onboardingUrl: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  let seller = await getSeller(input.authorId);
  let accountId = seller?.stripeAccountId;

  if (!accountId) {
    try {
      const account = await stripe.v2.core.accounts.create({
        contact_email: input.email,
        display_name: input.author,
        dashboard: "express",
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
        identity: {
          country: (input.country ?? "US").toLowerCase(),
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: { requested: true },
              },
            },
          },
        },
        metadata: {
          botshelf_author_id: input.authorId,
          botshelf_user_id: input.userId,
          platform: "botshelf",
        },
        include: ["configuration.recipient", "identity", "requirements"],
      });
      accountId = account.id;
    } catch (err) {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: { type: "express" },
          fees: { payer: "application" },
          losses: { payments: "application" },
        },
        capabilities: {
          transfers: { requested: true },
        },
        country: input.country ?? "US",
        email: input.email,
        business_profile: {
          name: input.author,
          url: "https://botshelf.net",
          product_description: "Bot templates sold on BotShelf",
        },
        metadata: {
          botshelf_author_id: input.authorId,
          botshelf_user_id: input.userId,
          platform: "botshelf",
        },
      });
      accountId = account.id;
      if (err instanceof Error) {
        void err;
      }
    }

    seller = await upsertSeller({
      authorId: input.authorId,
      userId: input.userId,
      author: input.author,
      email: input.email,
      stripeAccountId: accountId!,
      payoutsEnabled: false,
      detailsSubmitted: false,
      updatedAt: new Date().toISOString(),
    });
  }

  const link = await stripe.accountLinks.create({
    account: accountId!,
    refresh_url: appUrl("/sell?connect=refresh"),
    return_url: appUrl("/sell?connect=return"),
    type: "account_onboarding",
  });

  return { seller: seller!, onboardingUrl: link.url };
}

export async function refreshSellerConnectStatus(authorId: string): Promise<Seller | null> {
  const stripe = getStripe();
  const seller = await getSeller(authorId);
  if (!stripe || !seller?.stripeAccountId) return seller ?? null;
  if (!seller.userId) return seller;

  const account = await stripe.accounts.retrieve(seller.stripeAccountId);
  const transfers =
    account.capabilities?.transfers === "active" ||
    Boolean(account.payouts_enabled);

  return upsertSeller({
    ...seller,
    userId: seller.userId,
    payoutsEnabled: Boolean(account.payouts_enabled || transfers),
    detailsSubmitted: Boolean(account.details_submitted),
    updatedAt: new Date().toISOString(),
  });
}

export async function refreshAllSellerStatuses() {
  const sellers = await listSellers();
  const next = [];
  for (const seller of sellers) {
    next.push((await refreshSellerConnectStatus(seller.authorId)) ?? seller);
  }
  return next;
}

export function platformFeeCents(amountCents: number) {
  return Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
}

export function sellerPayoutCents(amountCents: number) {
  return amountCents - platformFeeCents(amountCents);
}
