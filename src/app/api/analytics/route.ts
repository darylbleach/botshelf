import { NextResponse } from "next/server";
import { getSellerAnalytics, listTemplates } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("authorId");
  const author = searchParams.get("author");

  let resolvedId = authorId;
  if (!resolvedId && author) {
    resolvedId = `author_${author.toLowerCase().replace(/\s+/g, "_")}`;
  }

  if (!resolvedId) {
    // Return author directory for picker
    const templates = await listTemplates();
    const authors = Array.from(
      new Map(
        templates.map((t) => [
          t.authorId,
          { authorId: t.authorId, author: t.author },
        ]),
      ).values(),
    );
    return NextResponse.json({ authors });
  }

  const analytics = await getSellerAnalytics(resolvedId);
  return NextResponse.json({ analytics });
}
