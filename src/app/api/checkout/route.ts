import { NextResponse } from "next/server";
import { addPurchase, addToWorkspace, bumpCopies, getSeller, getTemplate } from "@/lib/store";
import { STRIPE_CATALOG } from "@/lib/stripe-catalog";
import {
  appUrl,
  getStripe,
  platformFeeFromSale,
  sellerCashFromSale,
} from "@/lib/stripe";
import { effectivePrice } from "@/lib/types";
import { z } from "zod";

const schema = z.object({
  templateId: z.string(),
  buyerEmail: z.string().email().optional(),
  demo: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  const template = await getTemplate(parsed.data.templateId);
  if (!template || template.status !== "published") {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const price = effectivePrice(template);
  const email = parsed.data.buyerEmail ?? "buyer@botshelf.net";
  const catalog = STRIPE_CATALOG[template.id];
  const stripePriceId = template.stripePriceId ?? catalog?.priceId;
  const fee = platformFeeFromSale(price);
  const sellerCash = sellerCashFromSale(price);

  if (price === 0) {
    await bumpCopies(template.id);
    await addToWorkspace(template.id);
    return NextResponse.json({
      free: true,
      grokBotUrl: template.templateUrl,
      url: appUrl(`/success?template=${template.slug}&free=1`),
    });
  }

  const seller = await getSeller(template.authorId);
  const stripe = getStripe();
  const forceDemo = parsed.data.demo === true;

  if (forceDemo || !stripe) {
    await addPurchase({
      id: `pur_demo_${Date.now().toString(36)}`,
      templateId: template.id,
      buyerEmail: email,
      amountCents: price,
      sellerPayoutCents: sellerCash,
      platformFeeCents: fee,
      stripeAccountId: seller?.stripeAccountId,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({
      demo: true,
      url: appUrl(`/success?template=${template.slug}&demo=1`),
    });
  }

  if (!seller?.stripeAccountId || !seller.payoutsEnabled) {
    return NextResponse.json(
      {
        error:
          "This seller hasn't finished Stripe Connect yet, so cash payouts aren't enabled. Ask them to open Sell → Connect bank account.",
        needsConnect: true,
        authorId: template.authorId,
      },
      { status: 409 },
    );
  }

  const lineItem = stripePriceId
    ? { quantity: 1 as const, price: stripePriceId }
    : {
        quantity: 1 as const,
        price_data: {
          currency: "usd" as const,
          unit_amount: price,
          product_data: {
            name: template.title,
            description: `BotShelf template by ${template.author}`,
            metadata: {
              botshelf_template_id: template.id,
              platform: "botshelf",
            },
          },
        },
      };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [lineItem],
    // Destination charge: seller gets cash (85%), BotShelf keeps application fee (15%).
    payment_intent_data: {
      application_fee_amount: fee,
      transfer_data: {
        destination: seller.stripeAccountId,
      },
      metadata: {
        templateId: template.id,
        authorId: template.authorId,
        platform: "botshelf",
        sellerPayoutCents: String(sellerCash),
        platformFeeCents: String(fee),
      },
    },
    metadata: {
      templateId: template.id,
      authorId: template.authorId,
      platform: "botshelf",
      stripeAccountId: seller.stripeAccountId,
      sellerPayoutCents: String(sellerCash),
      platformFeeCents: String(fee),
    },
    success_url: appUrl(`/success?template=${template.slug}&session_id={CHECKOUT_SESSION_ID}`),
    cancel_url: appUrl(`/templates/${template.slug}?canceled=1`),
    integration_identifier: `botshelf_checkout_${Math.random().toString(36).slice(2, 10)}`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
