import { NextResponse } from "next/server";
import { addPurchase, addToWorkspace, bumpCopies, getTemplate } from "@/lib/store";
import { appUrl, creatorCreditsFromSale, getStripe } from "@/lib/stripe";
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
  const email = parsed.data.buyerEmail ?? "buyer@botshelf.bot";

  if (price === 0) {
    await bumpCopies(template.id);
    await addToWorkspace(template.id);
    return NextResponse.json({
      free: true,
      url: appUrl(`/success?template=${template.slug}&free=1`),
    });
  }

  const stripe = getStripe();
  const forceDemo = parsed.data.demo || !stripe;

  if (forceDemo || !stripe) {
    const purchaseId = `pur_demo_${Date.now().toString(36)}`;
    await addPurchase({
      id: purchaseId,
      templateId: template.id,
      buyerEmail: email,
      amountCents: price,
      creatorCredits: creatorCreditsFromSale(price),
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({
      demo: true,
      url: appUrl(`/success?template=${template.slug}&demo=1`),
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: price,
          product_data: {
            name: template.title,
            description: `BotShelf template by ${template.author}`,
          },
        },
      },
    ],
    metadata: {
      templateId: template.id,
      authorId: template.authorId,
    },
    success_url: appUrl(`/success?template=${template.slug}&session_id={CHECKOUT_SESSION_ID}`),
    cancel_url: appUrl(`/templates/${template.slug}?canceled=1`),
    integration_identifier: `botshelf_checkout_${Math.random().toString(36).slice(2, 10)}`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
