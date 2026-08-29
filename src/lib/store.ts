import { promises as fs } from "fs";
import path from "path";
import { SEED_TEMPLATES } from "./seed";
import type { Purchase, Seller, Template, WorkspaceItem } from "./types";

const DATA_DIR = path.join(process.cwd(), "src/data");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");
const WORKSPACE_FILE = path.join(DATA_DIR, "workspace.json");
const SELLERS_FILE = path.join(DATA_DIR, "sellers.json");

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(TEMPLATES_FILE);
  } catch {
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify(SEED_TEMPLATES, null, 2));
  }
  try {
    await fs.access(PURCHASES_FILE);
  } catch {
    await fs.writeFile(PURCHASES_FILE, JSON.stringify([], null, 2));
  }
  try {
    await fs.access(WORKSPACE_FILE);
  } catch {
    await fs.writeFile(WORKSPACE_FILE, JSON.stringify([], null, 2));
  }
  try {
    await fs.access(SELLERS_FILE);
  } catch {
    await fs.writeFile(SELLERS_FILE, JSON.stringify([], null, 2));
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureFiles();
  const raw = await fs.readFile(file, "utf8");
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T) {
  await ensureFiles();
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export async function listTemplates(): Promise<Template[]> {
  return readJson<Template[]>(TEMPLATES_FILE, SEED_TEMPLATES);
}

export async function getTemplate(idOrSlug: string): Promise<Template | undefined> {
  const templates = await listTemplates();
  return templates.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
}

export async function createTemplate(
  input: Omit<Template, "id" | "copies" | "views" | "createdAt" | "status" | "featured"> & {
    featured?: boolean;
    status?: Template["status"];
    views?: number;
  },
): Promise<Template> {
  const templates = await listTemplates();
  const template: Template = {
    ...input,
    id: `tpl_${Date.now().toString(36)}`,
    copies: 0,
    views: input.views ?? 0,
    createdAt: new Date().toISOString(),
    featured: input.featured ?? false,
    status: input.status ?? "pending",
  };
  templates.unshift(template);
  await writeJson(TEMPLATES_FILE, templates);
  return template;
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
  const templates = await listTemplates();
  const idx = templates.findIndex((t) => t.id === id || t.slug === id);
  if (idx < 0) return undefined;
  const next: Template = { ...templates[idx], ...patch };
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
  templates[idx] = next;
  await writeJson(TEMPLATES_FILE, templates);
  return next;
}

export async function bumpCopies(templateId: string) {
  const templates = await listTemplates();
  const next = templates.map((t) =>
    t.id === templateId ? { ...t, copies: t.copies + 1 } : t,
  );
  await writeJson(TEMPLATES_FILE, next);
}

export async function bumpViews(templateId: string) {
  const templates = await listTemplates();
  const next = templates.map((t) =>
    t.id === templateId || t.slug === templateId
      ? { ...t, views: (t.views ?? 0) + 1 }
      : t,
  );
  await writeJson(TEMPLATES_FILE, next);
}

export async function listPurchases(): Promise<Purchase[]> {
  return readJson<Purchase[]>(PURCHASES_FILE, []);
}

export async function addPurchase(purchase: Purchase) {
  const purchases = await listPurchases();
  if (purchase.stripeSessionId) {
    const exists = purchases.some((p) => p.stripeSessionId === purchase.stripeSessionId);
    if (exists) return;
  }
  purchases.unshift(purchase);
  await writeJson(PURCHASES_FILE, purchases);
  await bumpCopies(purchase.templateId);
  await addToWorkspace(purchase.templateId);
}

export async function listWorkspace(): Promise<WorkspaceItem[]> {
  return readJson<WorkspaceItem[]>(WORKSPACE_FILE, []);
}

export async function addToWorkspace(templateId: string) {
  const items = await listWorkspace();
  if (items.some((i) => i.templateId === templateId)) return items;
  items.unshift({ templateId, addedAt: new Date().toISOString() });
  await writeJson(WORKSPACE_FILE, items);
  return items;
}

export async function listSellers(): Promise<Seller[]> {
  return readJson<Seller[]>(SELLERS_FILE, []);
}

export async function getSeller(authorId: string): Promise<Seller | undefined> {
  const sellers = await listSellers();
  return sellers.find((s) => s.authorId === authorId);
}

export async function upsertSeller(seller: Seller): Promise<Seller> {
  const sellers = await listSellers();
  const idx = sellers.findIndex((s) => s.authorId === seller.authorId);
  if (idx >= 0) sellers[idx] = seller;
  else sellers.unshift(seller);
  await writeJson(SELLERS_FILE, sellers);
  return seller;
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

  // Last 14 days series
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
      // views are cumulative; show 0 for daily unless we store events — approximate evenly
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
