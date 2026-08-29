import { NextResponse } from "next/server";
import { auth, authorIdForUser } from "@/lib/auth";
import { bumpViews, getTemplate, updateTemplate } from "@/lib/store";
import { syncTemplateStripePrice } from "@/lib/pricing";
import { z } from "zod";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const template = await getTemplate(id);
  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ template });
}

const patchSchema = z.object({
  priceCents: z.number().int().min(0).max(100000).optional(),
  salePriceCents: z.number().int().min(0).max(100000).nullable().optional(),
  title: z.string().min(2).max(80).optional(),
  description: z.string().min(10).max(280).optional(),
  trackView: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.trackView) {
    await bumpViews(id);
    const template = await getTemplate(id);
    return NextResponse.json({ template });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const existing = await getTemplate(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.authorId !== authorIdForUser(session.user.id)) {
    return NextResponse.json({ error: "Not your template" }, { status: 403 });
  }

  const patch: Parameters<typeof updateTemplate>[1] = {};
  if (parsed.data.title) patch.title = parsed.data.title;
  if (parsed.data.description) patch.description = parsed.data.description;
  if (parsed.data.priceCents != null) patch.priceCents = parsed.data.priceCents;
  if (parsed.data.salePriceCents === null) {
    patch.salePriceCents = undefined;
  } else if (parsed.data.salePriceCents != null) {
    patch.salePriceCents = parsed.data.salePriceCents;
  }

  let updated = await updateTemplate(existing.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  const priceChanged =
    parsed.data.priceCents != null || parsed.data.salePriceCents !== undefined;
  if (priceChanged) {
    try {
      const stripeIds = await syncTemplateStripePrice(updated);
      if (stripeIds) {
        updated =
          (await updateTemplate(updated.id, {
            stripeProductId: stripeIds.stripeProductId,
            stripePriceId: stripeIds.stripePriceId,
          })) ?? updated;
      }
    } catch {
      // Price still saved locally if Stripe sync fails.
    }
  }

  return NextResponse.json({ template: updated });
}
