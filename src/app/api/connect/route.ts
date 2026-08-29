import { NextResponse } from "next/server";
import { z } from "zod";
import { createSellerConnectAccount, refreshSellerConnectStatus } from "@/lib/connect";
import { getSeller, listSellers } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("authorId");
  if (authorId) {
    const seller = await refreshSellerConnectStatus(authorId);
    return NextResponse.json({ seller });
  }
  const sellers = await listSellers();
  return NextResponse.json({ sellers });
}

const schema = z.object({
  authorId: z.string().min(2),
  author: z.string().min(2),
  email: z.string().email(),
  country: z.string().length(2).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Connect payload" }, { status: 400 });
  }

  try {
    const result = await createSellerConnectAccount(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connect onboarding failed";
    // Surface claimable-sandbox limitation clearly
    if (/claimable sandbox|v2_account_storer|Permission denied|does not have access/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "This Stripe key can't create Connect accounts yet. Claim the BotShelf sandbox (or use a full BotShelf secret key with Connect), then retry.",
          detail: message,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const authorId = body.authorId as string | undefined;
  if (!authorId) {
    return NextResponse.json({ error: "authorId required" }, { status: 400 });
  }
  const existing = await getSeller(authorId);
  if (!existing) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }
  const seller = await refreshSellerConnectStatus(authorId);
  return NextResponse.json({ seller });
}
