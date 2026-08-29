import { NextResponse } from "next/server";
import { addPurchase, listSellers, upsertSeller } from "@/lib/store";
import { getStripe, platformFeeFromSale, sellerCashFromSale } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return;
  }
  const templateId = session.metadata?.templateId;
  if (!templateId) return;

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

async function syncConnectedAccount(account: Stripe.Account) {
  const authorId = account.metadata?.botshelf_author_id;
  if (!authorId) {
    const sellers = await listSellers();
    const existing = sellers.find((s) => s.stripeAccountId === account.id);
    if (!existing) return;
    await upsertSeller({
      ...existing,
      payoutsEnabled: Boolean(
        account.payouts_enabled || account.capabilities?.transfers === "active",
      ),
      detailsSubmitted: Boolean(account.details_submitted),
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const sellers = await listSellers();
  const existing = sellers.find((s) => s.authorId === authorId);
  await upsertSeller({
    authorId,
    author: existing?.author ?? account.business_profile?.name ?? authorId,
    email: existing?.email ?? account.email ?? "",
    stripeAccountId: account.id,
    payoutsEnabled: Boolean(
      account.payouts_enabled || account.capabilities?.transfers === "active",
    ),
    detailsSubmitted: Boolean(account.details_submitted),
    updatedAt: new Date().toISOString(),
  });
}

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
    if (!webhookSecret) {
      return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET missing" }, { status: 500 });
    }
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.async_payment_failed":
      break;
    case "account.updated":
      await syncConnectedAccount(event.data.object as Stripe.Account);
      break;
    case "capability.updated": {
      const capability = event.data.object as Stripe.Capability;
      if (capability.account) {
        const accountId =
          typeof capability.account === "string"
            ? capability.account
            : capability.account.id;
        const account = await stripe.accounts.retrieve(accountId);
        await syncConnectedAccount(account);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/webhooks/stripe",
    expects: ["checkout.session.*", "account.updated", "capability.updated"],
  });
}
