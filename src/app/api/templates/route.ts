import { NextResponse } from "next/server";
import { createTemplate, listTemplates } from "@/lib/store";
import type { Category, Integration } from "@/lib/types";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase().trim();
  const category = searchParams.get("category");
  const filter = searchParams.get("filter") ?? "All";
  const includePending = searchParams.get("pending") === "1";

  let templates = await listTemplates();
  if (!includePending) {
    templates = templates.filter((t) => t.status === "published");
  }

  if (category && category !== "All") {
    templates = templates.filter((t) => t.category === category);
  }

  if (q) {
    templates = templates.filter((t) => {
      const hay = `${t.title} ${t.author} ${t.description} ${t.instructions} ${t.category}`.toLowerCase();
      return hay.includes(q);
    });
  }

  switch (filter) {
    case "Free":
      templates = templates.filter((t) => (t.salePriceCents ?? t.priceCents) === 0);
      break;
    case "Sale":
      templates = templates.filter(
        (t) => t.salePriceCents != null && t.salePriceCents < t.priceCents,
      );
      break;
    case "Top":
      templates = [...templates].sort((a, b) => b.copies - a.copies);
      break;
    case "New":
      templates = [...templates].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );
      break;
    case "Featured":
      templates = templates.filter((t) => t.featured);
      break;
    default:
      break;
  }

  return NextResponse.json({ templates });
}

const submitSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().min(10).max(280),
  longDescription: z.string().min(20).max(2000).optional(),
  category: z.string(),
  author: z.string().min(2).max(40),
  priceCents: z.number().int().min(0).max(100000),
  salePriceCents: z.number().int().min(0).max(100000).optional(),
  templateUrl: z.string().url(),
  instructions: z.string().min(5).max(1000),
  integrations: z.array(z.string()).min(1).max(6),
  listForSale: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|$)/g, "");

  const template = await createTemplate({
    slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
    title: data.title,
    description: data.description,
    longDescription: data.longDescription ?? data.description,
    category: data.category as Category,
    author: data.author,
    authorId: `author_${data.author.toLowerCase().replace(/\s+/g, "_")}`,
    priceCents: data.listForSale === false ? 0 : data.priceCents,
    salePriceCents: data.salePriceCents,
    integrations: data.integrations as Integration[],
    instructions: data.instructions,
    templateUrl: data.templateUrl,
    status: "published",
    featured: false,
  });

  return NextResponse.json({ template }, { status: 201 });
}
