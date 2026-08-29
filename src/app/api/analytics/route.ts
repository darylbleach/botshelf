import { NextResponse } from "next/server";
import { auth, authorIdForUser } from "@/lib/auth";
import { getSellerAnalytics } from "@/lib/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const authorId = authorIdForUser(session.user.id);
  const analytics = await getSellerAnalytics(authorId);
  return NextResponse.json({
    analytics,
    author: {
      authorId,
      author: analytics.author,
      email: session.user.email,
    },
  });
}
