import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, authorIdForUser, displayNameFromUser } from "@/lib/auth";
import { createSellerConnectAccount, refreshSellerConnectStatus } from "@/lib/connect";
import { getSeller, getSellerByUserId, listSellers } from "@/lib/store";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("authorId");

  if (authorId) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const mine = authorIdForUser(session.user.id);
    if (authorId !== mine) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const seller = await refreshSellerConnectStatus(authorId);
    return NextResponse.json({ seller });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ sellers: [] });
  }
  const seller = await getSellerByUserId(session.user.id);
  return NextResponse.json({ sellers: seller ? [seller] : [] });
}

const schema = z.object({
  author: z.string().min(2).optional(),
  email: z.string().email().optional(),
  country: z.string().length(2).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Connect payload" }, { status: 400 });
  }

  const authorId = authorIdForUser(session.user.id);
  const author =
    parsed.data.author?.trim() ||
    displayNameFromUser({ name: session.user.name, email: session.user.email });
  const email = parsed.data.email || session.user.email;

  try {
    const result = await createSellerConnectAccount({
      authorId,
      author,
      email,
      userId: session.user.id,
      country: parsed.data.country,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connect onboarding failed";
    if (/claimable sandbox|v2_account_storer|Permission denied|does not have access/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "This Stripe key can't create Connect accounts yet. Finish the Stripe Connect platform profile, then retry.",
          detail: message,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const authorId = authorIdForUser(session.user.id);
  const existing = await getSeller(authorId);
  if (!existing) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }
  const seller = await refreshSellerConnectStatus(authorId);
  return NextResponse.json({ seller });
}
