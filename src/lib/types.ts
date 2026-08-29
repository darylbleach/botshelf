export type Category =
  | "Marketing"
  | "Productivity"
  | "Personal"
  | "Ops"
  | "Sales"
  | "Fun"
  | "Engineering"
  | "Research"
  | "Writing"
  | "Finance"
  | "Support"
  | "Other";

export type Integration =
  | "gmail"
  | "x"
  | "browser"
  | "slack"
  | "notion"
  | "calendar";

export interface Template {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: Category;
  author: string;
  authorId: string;
  priceCents: number;
  salePriceCents?: number;
  copies: number;
  featured: boolean;
  createdAt: string;
  integrations: Integration[];
  instructions: string;
  templateUrl: string;
  status: "published" | "pending";
}

export interface Purchase {
  id: string;
  templateId: string;
  buyerEmail: string;
  amountCents: number;
  creatorCredits: number;
  stripeSessionId?: string;
  createdAt: string;
}

export interface WorkspaceItem {
  templateId: string;
  addedAt: string;
}

export const CATEGORIES: Array<Category | "All"> = [
  "All",
  "Marketing",
  "Productivity",
  "Personal",
  "Ops",
  "Sales",
  "Fun",
  "Engineering",
  "Research",
  "Writing",
  "Finance",
  "Support",
  "Other",
];

export const FILTERS = ["All", "Free", "Sale", "Top", "New", "Featured"] as const;
export type Filter = (typeof FILTERS)[number];

export function effectivePrice(t: Template): number {
  return t.salePriceCents ?? t.priceCents;
}

export function isOnSale(t: Template): boolean {
  return t.salePriceCents != null && t.salePriceCents < t.priceCents;
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
