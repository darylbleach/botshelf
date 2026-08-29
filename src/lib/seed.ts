import type { Template } from "./types";

/**
 * Launch catalog: only include bots with a verified live x.ai/bot URL.
 * Placeholder IDs 404 — do not charge for them. Real sellers publish via /submit.
 */
const REAL_OPS_PAGER_URL = "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr";

export const SEED_TEMPLATES: Template[] = [
  {
    id: "tpl_ops_pager",
    slug: "ops-pager",
    title: "Ops Pager",
    description:
      "Turns incident notes into status updates, owner assignments, and a clean postmortem skeleton.",
    longDescription:
      "Ops Pager keeps incidents calm: draft status, page owners, and scaffold the postmortem while the fire is fresh. Live Grok Bot — free to add.",
    category: "Ops",
    author: "BotShelf",
    authorId: "author_botshelf",
    priceCents: 0,
    copies: 149,
    views: 487,
    featured: true,
    createdAt: "2026-08-27T20:00:00.000Z",
    integrations: ["slack", "notion"],
    instructions: "Paste incident timeline. Ops Pager returns status + postmortem outline.",
    templateUrl: REAL_OPS_PAGER_URL,
    status: "published",
  },
];
