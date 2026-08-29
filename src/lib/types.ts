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
  stripePriceId?: string;
  stripeProductId?: string;
  copies: number;
  views: number;
  featured: boolean;
  createdAt: string;
  integrations: Integration[];
  instructions: string;
  templateUrl: string;
  status: "published" | "pending" | "removed";
}

export interface Purchase {
  id: string;
  templateId: string;
  buyerEmail: string;
  amountCents: number;
  /** Cash sent to seller via Connect (85%). */
  sellerPayoutCents: number;
  /** BotShelf platform fee (15%). */
  platformFeeCents: number;
  /** @deprecated alias of sellerPayoutCents */
  creatorCredits?: number;
  stripeSessionId?: string;
  stripeAccountId?: string;
  createdAt: string;
}

export interface Seller {
  authorId: string;
  author: string;
  email: string;
  userId?: string;
  stripeAccountId?: string;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  updatedAt: string;
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
