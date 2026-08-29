import { NextResponse } from "next/server";
import { addToWorkspace, bumpCopies, getTemplate, listTemplates, listWorkspace } from "@/lib/store";

export async function GET() {
  const [items, templates] = await Promise.all([listWorkspace(), listTemplates()]);
  const enriched = items
    .map((item) => ({
      ...item,
      template: templates.find((t) => t.id === item.templateId),
    }))
    .filter((x) => x.template);

  return NextResponse.json({ items: enriched });
}

export async function POST(request: Request) {
  const body = await request.json();
  const templateId = body.templateId as string;
  const template = await getTemplate(templateId);
  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if ((template.salePriceCents ?? template.priceCents) > 0) {
    return NextResponse.json(
      { error: "Paid template — use checkout" },
      { status: 402 },
    );
  }
  await bumpCopies(template.id);
  await addToWorkspace(template.id);
  return NextResponse.json({ ok: true });
}
