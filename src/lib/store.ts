import { promises as fs } from "fs";
import path from "path";
import { SEED_TEMPLATES } from "./seed";
import type { Purchase, Template, WorkspaceItem } from "./types";

const DATA_DIR = path.join(process.cwd(), "src/data");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");
const WORKSPACE_FILE = path.join(DATA_DIR, "workspace.json");

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
  input: Omit<Template, "id" | "copies" | "createdAt" | "status" | "featured"> & {
    featured?: boolean;
    status?: Template["status"];
  },
): Promise<Template> {
  const templates = await listTemplates();
  const template: Template = {
    ...input,
    id: `tpl_${Date.now().toString(36)}`,
    copies: 0,
    createdAt: new Date().toISOString(),
    featured: input.featured ?? false,
    status: input.status ?? "pending",
  };
  templates.unshift(template);
  await writeJson(TEMPLATES_FILE, templates);
  return template;
}

export async function bumpCopies(templateId: string) {
  const templates = await listTemplates();
  const next = templates.map((t) =>
    t.id === templateId ? { ...t, copies: t.copies + 1 } : t,
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

export async function creatorEarnings() {
  const [templates, purchases] = await Promise.all([listTemplates(), listPurchases()]);
  const byAuthor = new Map<
    string,
    {
      authorId: string;
      author: string;
      salesCount: number;
      creditsEarned: number;
      templatesPublished: number;
      revenueCents: number;
    }
  >();

  for (const t of templates.filter((x) => x.status === "published")) {
    const row = byAuthor.get(t.authorId) ?? {
      authorId: t.authorId,
      author: t.author,
      salesCount: 0,
      creditsEarned: 0,
      templatesPublished: 0,
      revenueCents: 0,
    };
    row.templatesPublished += 1;
    byAuthor.set(t.authorId, row);
  }

  for (const p of purchases) {
    const tpl = templates.find((t) => t.id === p.templateId);
    if (!tpl) continue;
    const row = byAuthor.get(tpl.authorId) ?? {
      authorId: tpl.authorId,
      author: tpl.author,
      salesCount: 0,
      creditsEarned: 0,
      templatesPublished: 0,
      revenueCents: 0,
    };
    row.salesCount += 1;
    row.creditsEarned += p.creatorCredits;
    row.revenueCents += p.amountCents;
    byAuthor.set(tpl.authorId, row);
  }

  return Array.from(byAuthor.values()).sort((a, b) => b.creditsEarned - a.creditsEarned);
}
