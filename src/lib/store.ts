import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  purchases as purchasesTable,
  sellers as sellersTable,
  templates as templatesTable,
  workspace as workspaceTable,
} from "@/lib/db/schema";
import type { Purchase, Seller, Template, WorkspaceItem } from "./types";

function mapTemplate(row: typeof templatesTable.$inferSelect): Template {
  const t: Template = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    longDescription: row.longDescription,
    category: row.category as Template["category"],
    author: row.author,
    authorId: row.authorId,
    priceCents: row.priceCents,
    copies: row.copies,
    views: row.views,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
    integrations: row.integrations as Template["integrations"],
    instructions: row.instructions,
    templateUrl: row.templateUrl,
    status: row.status as Template["status"],
  };
  if (row.salePriceCents != null) t.salePriceCents = row.salePriceCents;
  if (row.stripePriceId) t.stripePriceId = row.stripePriceId;
  if (row.stripeProductId) t.stripeProductId = row.stripeProductId;
  return t;
}

function mapSeller(row: typeof sellersTable.$inferSelect): Seller {
  return {
    authorId: row.authorId,
    author: row.author,
    email: row.email,
    userId: row.userId,
    stripeAccountId: row.stripeAccountId ?? undefined,
    payoutsEnabled: row.payoutsEnabled,
    detailsSubmitted: row.detailsSubmitted,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPurchase(row: typeof purchasesTable.$inferSelect): Purchase {
  return {
    id: row.id,
    templateId: row.templateId,
    buyerEmail: row.buyerEmail,
    amountCents: row.amountCents,
    sellerPayoutCents: row.sellerPayoutCents,
    platformFeeCents: row.platformFeeCents,
    creatorCredits: row.sellerPayoutCents,
    stripeSessionId: row.stripeSessionId ?? undefined,
    stripeAccountId: row.stripeAccountId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listTemplates(): Promise<Template[]> {
  const rows = await db
    .select()
    .from(templatesTable)
    .orderBy(desc(templatesTable.createdAt));
  return rows.map(mapTemplate);
}

export async function getTemplate(idOrSlug: string): Promise<Template | undefined> {
  const rows = await db
    .select()
    .from(templatesTable)
    .where(
      sql`${templatesTable.id} = ${idOrSlug} OR ${templatesTable.slug} = ${idOrSlug}`,
    )
    .limit(1);
  return rows[0] ? mapTemplate(rows[0]) : undefined;
}

export async function createTemplate(
  input: Omit<Template, "id" | "copies" | "views" | "createdAt" | "status" | "featured"> & {
    featured?: boolean;
    status?: Template["status"];
    views?: number;
    userId?: string;
  },
): Promise<Template> {
  const id = `tpl_${Date.now().toString(36)}`;
  const [row] = await db
    .insert(templatesTable)
    .values({
      id,
      slug: input.slug,
      title: input.title,
      description: input.description,
      longDescription: input.longDescription,
      category: input.category,
      author: input.author,
      authorId: input.authorId,
      userId: input.userId,
      priceCents: input.priceCents,
      salePriceCents: input.salePriceCents,
      integrations: input.integrations,
      instructions: input.instructions,
      templateUrl: input.templateUrl,
      featured: input.featured ?? false,
      status: input.status ?? "pending",
      views: input.views ?? 0,
      copies: 0,
    })
    .returning();
  return mapTemplate(row);
}

export async function updateTemplate(
  id: string,
  patch: Partial<
    Pick<
      Template,
      | "title"
      | "description"
      | "longDescription"
      | "priceCents"
      | "salePriceCents"
      | "stripePriceId"
      | "stripeProductId"
      | "status"
      | "featured"
      | "instructions"
      | "templateUrl"
      | "category"
      | "integrations"
    >
  >,
): Promise<Template | undefined> {
  const existing = await getTemplate(id);
  if (!existing) return undefined;

  const next: Template = { ...existing, ...patch };
  if ("salePriceCents" in patch && patch.salePriceCents == null) {
    delete next.salePriceCents;
  }
  if (next.priceCents === 0) {
    delete next.salePriceCents;
  } else if (
    next.salePriceCents != null &&
    (next.salePriceCents <= 0 || next.salePriceCents >= next.priceCents)
  ) {
    delete next.salePriceCents;
  }

  const [row] = await db
    .update(templatesTable)
    .set({
      title: next.title,
      description: next.description,
      longDescription: next.longDescription,
      priceCents: next.priceCents,
      salePriceCents: next.salePriceCents ?? null,
      stripePriceId: next.stripePriceId,
      stripeProductId: next.stripeProductId,
      status: next.status,
      featured: next.featured,
      instructions: next.instructions,
      templateUrl: next.templateUrl,
      category: next.category,
      integrations: next.integrations,
    })
    .where(
      sql`${templatesTable.id} = ${id} OR ${templatesTable.slug} = ${id}`,
    )
    .returning();
  return row ? mapTemplate(row) : undefined;
}

export async function bumpCopies(templateId: string) {
  await db
    .update(templatesTable)
    .set({ copies: sql`${templatesTable.copies} + 1` })
    .where(eq(templatesTable.id, templateId));
}

export async function bumpViews(templateId: string) {
  await db
    .update(templatesTable)
    .set({ views: sql`${templatesTable.views} + 1` })
    .where(
      sql`${templatesTable.id} = ${templateId} OR ${templatesTable.slug} = ${templateId}`,
    );
}

export async function listPurchases(): Promise<Purchase[]> {
  const rows = await db
    .select()
    .from(purchasesTable)
    .orderBy(desc(purchasesTable.createdAt));
  return rows.map(mapPurchase);
}

export async function addPurchase(purchase: Purchase) {
  if (purchase.stripeSessionId) {
    const existing = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.stripeSessionId, purchase.stripeSessionId))
      .limit(1);
    if (existing.length) return;
  }
  await db.insert(purchasesTable).values({
    id: purchase.id,
    templateId: purchase.templateId,
    buyerEmail: purchase.buyerEmail,
    amountCents: purchase.amountCents,
    sellerPayoutCents: purchase.sellerPayoutCents,
    platformFeeCents: purchase.platformFeeCents,
    stripeSessionId: purchase.stripeSessionId,
    stripeAccountId: purchase.stripeAccountId,
    createdAt: new Date(purchase.createdAt),
  });
  await bumpCopies(purchase.templateId);
  await addToWorkspace(purchase.templateId);
}

export async function listWorkspace(userId?: string): Promise<WorkspaceItem[]> {
  if (!userId) return [];
  const rows = await db
    .select()
    .from(workspaceTable)
    .where(eq(workspaceTable.userId, userId))
    .orderBy(desc(workspaceTable.addedAt));
  return rows.map((r) => ({
    templateId: r.templateId,
    addedAt: r.addedAt.toISOString(),
  }));
}

export async function addToWorkspace(templateId: string, userId?: string) {
  if (!userId) return listWorkspace();
  await db
    .insert(workspaceTable)
    .values({ userId, templateId })
    .onConflictDoNothing();
  return listWorkspace(userId);
}

export async function listSellers(): Promise<Seller[]> {
  const rows = await db.select().from(sellersTable);
  return rows.map(mapSeller);
}

export async function getSeller(authorId: string): Promise<Seller | undefined> {
  const rows = await db
    .select()
    .from(sellersTable)
    .where(eq(sellersTable.authorId, authorId))
    .limit(1);
  return rows[0] ? mapSeller(rows[0]) : undefined;
}

export async function getSellerByUserId(userId: string): Promise<Seller | undefined> {
  const rows = await db
    .select()
    .from(sellersTable)
    .where(eq(sellersTable.userId, userId))
    .limit(1);
  return rows[0] ? mapSeller(rows[0]) : undefined;
}

export async function upsertSeller(
  seller: Seller & { userId: string },
): Promise<Seller> {
  const [row] = await db
    .insert(sellersTable)
    .values({
      authorId: seller.authorId,
      userId: seller.userId,
      author: seller.author,
      email: seller.email,
      stripeAccountId: seller.stripeAccountId,
      payoutsEnabled: seller.payoutsEnabled,
      detailsSubmitted: seller.detailsSubmitted,
      updatedAt: new Date(seller.updatedAt),
    })
    .onConflictDoUpdate({
      target: sellersTable.authorId,
      set: {
        author: seller.author,
        email: seller.email,
        stripeAccountId: seller.stripeAccountId,
        payoutsEnabled: seller.payoutsEnabled,
        detailsSubmitted: seller.detailsSubmitted,
        updatedAt: new Date(seller.updatedAt),
        userId: seller.userId,
      },
    })
    .returning();
  return mapSeller(row);
}

export async function creatorEarnings() {
  const [templates, purchases, sellers] = await Promise.all([
    listTemplates(),
    listPurchases(),
    listSellers(),
  ]);
  const byAuthor = new Map<
    string,
    {
      authorId: string;
      author: string;
      salesCount: number;
      cashEarnedCents: number;
      templatesPublished: number;
      revenueCents: number;
      payoutsEnabled: boolean;
      stripeAccountId?: string;
    }
  >();

  for (const t of templates.filter((x) => x.status === "published")) {
    const seller = sellers.find((s) => s.authorId === t.authorId);
    const row = byAuthor.get(t.authorId) ?? {
      authorId: t.authorId,
      author: t.author,
      salesCount: 0,
      cashEarnedCents: 0,
      templatesPublished: 0,
      revenueCents: 0,
      payoutsEnabled: Boolean(seller?.payoutsEnabled),
      stripeAccountId: seller?.stripeAccountId,
    };
    row.templatesPublished += 1;
    byAuthor.set(t.authorId, row);
  }

  for (const p of purchases) {
    const tpl = templates.find((t) => t.id === p.templateId);
    if (!tpl) continue;
    const seller = sellers.find((s) => s.authorId === tpl.authorId);
    const row = byAuthor.get(tpl.authorId) ?? {
      authorId: tpl.authorId,
      author: tpl.author,
      salesCount: 0,
      cashEarnedCents: 0,
      templatesPublished: 0,
      revenueCents: 0,
      payoutsEnabled: Boolean(seller?.payoutsEnabled),
      stripeAccountId: seller?.stripeAccountId,
    };
    row.salesCount += 1;
    row.cashEarnedCents += p.sellerPayoutCents ?? p.creatorCredits ?? 0;
    row.revenueCents += p.amountCents;
    byAuthor.set(tpl.authorId, row);
  }

  return Array.from(byAuthor.values()).sort((a, b) => b.cashEarnedCents - a.cashEarnedCents);
}

export async function getSellerAnalytics(authorId: string) {
  const [templates, purchases, seller] = await Promise.all([
    listTemplates(),
    listPurchases(),
    getSeller(authorId),
  ]);

  const mine = templates.filter((t) => t.authorId === authorId);
  const myPurchases = purchases.filter((p) =>
    mine.some((t) => t.id === p.templateId),
  );

  const totalViews = mine.reduce((sum, t) => sum + (t.views ?? 0), 0);
  const totalSales = myPurchases.length;
  const grossCents = myPurchases.reduce((sum, p) => sum + p.amountCents, 0);
  const cashCents = myPurchases.reduce(
    (sum, p) => sum + (p.sellerPayoutCents ?? p.creatorCredits ?? 0),
    0,
  );
  const platformFeeCents = myPurchases.reduce(
    (sum, p) => sum + (p.platformFeeCents ?? 0),
    0,
  );
  const conversion =
    totalViews > 0 ? Math.round((totalSales / totalViews) * 1000) / 10 : 0;

  const byTemplate = mine
    .map((t) => {
      const sales = myPurchases.filter((p) => p.templateId === t.id);
      const revenue = sales.reduce((sum, p) => sum + p.amountCents, 0);
      const cash = sales.reduce(
        (sum, p) => sum + (p.sellerPayoutCents ?? p.creatorCredits ?? 0),
        0,
      );
      return {
        id: t.id,
        slug: t.slug,
        title: t.title,
        priceCents: t.priceCents,
        salePriceCents: t.salePriceCents,
        views: t.views ?? 0,
        copies: t.copies,
        sales: sales.length,
        revenueCents: revenue,
        cashCents: cash,
        conversion:
          (t.views ?? 0) > 0
            ? Math.round((sales.length / (t.views ?? 1)) * 1000) / 10
            : 0,
      };
    })
    .sort((a, b) => b.cashCents - a.cashCents);

  const days: Array<{ date: string; sales: number; cashCents: number; views: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayPurchases = myPurchases.filter((p) => p.createdAt.slice(0, 10) === key);
    days.push({
      date: key,
      sales: dayPurchases.length,
      cashCents: dayPurchases.reduce(
        (sum, p) => sum + (p.sellerPayoutCents ?? p.creatorCredits ?? 0),
        0,
      ),
      views: 0,
    });
  }

  return {
    authorId,
    author: mine[0]?.author ?? seller?.author ?? authorId,
    seller,
    totals: {
      templates: mine.length,
      views: totalViews,
      sales: totalSales,
      grossCents,
      cashCents,
      platformFeeCents,
      conversion,
      avgOrderCents: totalSales ? Math.round(grossCents / totalSales) : 0,
    },
    byTemplate,
    recentSales: myPurchases.slice(0, 20).map((p) => {
      const t = mine.find((x) => x.id === p.templateId);
      return {
        id: p.id,
        templateTitle: t?.title ?? p.templateId,
        buyerEmail: p.buyerEmail,
        amountCents: p.amountCents,
        sellerPayoutCents: p.sellerPayoutCents ?? p.creatorCredits ?? 0,
        platformFeeCents: p.platformFeeCents ?? 0,
        createdAt: p.createdAt,
      };
    }),
    series: days,
  };
}
