import { NextResponse } from "next/server";
import { addPurchase } from "@/lib/store";
import { getStripe, platformFeeFromSale, sellerCashFromSale } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const templateId = session.metadata?.templateId;
      if (templateId) {
        const amount = session.amount_total ?? 0;
        const sellerPayout = session.metadata?.sellerPayoutCents
          ? Number(session.metadata.sellerPayoutCents)
          : sellerCashFromSale(amount);
        const platformFee = session.metadata?.platformFeeCents
          ? Number(session.metadata.platformFeeCents)
          : platformFeeFromSale(amount);

        await addPurchase({
          id: `pur_${session.id}`,
          templateId,
          buyerEmail:
            session.customer_details?.email ??
            session.customer_email ??
            "buyer@botshelf.net",
          amountCents: amount,
          sellerPayoutCents: sellerPayout,
          platformFeeCents: platformFee,
          stripeSessionId: session.id,
          stripeAccountId: session.metadata?.stripeAccountId,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  if (
    event.type === "account.updated" &&
    typeof event.data.object === "object" &&
    event.data.object &&
    "id" in event.data.object
  ) {
    // Seller Connect status is refreshed from /api/connect and /sell return URL.
  }

  return NextResponse.json({ received: true });
}
