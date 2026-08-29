import { NextResponse } from "next/server";
import { addPurchase, creatorEarnings, listPurchases } from "@/lib/store";
import { creatorCreditsFromSale, getStripe } from "@/lib/stripe";

export async function GET() {
  const [purchases, earnings] = await Promise.all([listPurchases(), creatorEarnings()]);
  return NextResponse.json({ purchases, earnings });
}

export async function POST(request: Request) {
  const body = await request.json();
  const sessionId = body.sessionId as string | undefined;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not complete" }, { status: 400 });
  }

  const templateId = session.metadata?.templateId;
  if (!templateId) {
    return NextResponse.json({ error: "Missing template metadata" }, { status: 400 });
  }

  const amount = session.amount_total ?? 0;
  await addPurchase({
    id: `pur_${session.id}`,
    templateId,
    buyerEmail: session.customer_details?.email ?? session.customer_email ?? "buyer@botshelf.bot",
    amountCents: amount,
    creatorCredits: creatorCreditsFromSale(amount),
    stripeSessionId: session.id,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
